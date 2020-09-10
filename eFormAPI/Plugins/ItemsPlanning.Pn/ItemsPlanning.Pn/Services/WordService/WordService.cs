/*
The MIT License (MIT)

Copyright (c) 2007 - 2020 Microting A/S

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

using eFormCore;
using ImageMagick;
using Microting.ItemsPlanningBase.Infrastructure.Data;

namespace ItemsPlanning.Pn.Services.WordService
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Drawing;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.Threading.Tasks;
    using Infrastructure.Models.Report;
    using ItemsPlanningLocalizationService;
    using Microsoft.EntityFrameworkCore.Internal;
    using Microsoft.Extensions.Logging;
    using Microting.eForm.Dto;
    using Microting.eFormApi.BasePn.Abstractions;
    using Microting.eFormApi.BasePn.Infrastructure.Models.API;

    public class WordService : IWordService
    {
        private readonly ILogger<WordService> _logger;
        private readonly IItemsPlanningLocalizationService _localizationService;
        private readonly IEFormCoreService _coreHelper;
        private bool _s3Enabled;
        private bool _swiftEnabled;
        private readonly ItemsPlanningPnDbContext _dbContext;

        public WordService(
            ILogger<WordService> logger,
            IItemsPlanningLocalizationService localizationService,
            IEFormCoreService coreHelper,
            ItemsPlanningPnDbContext dbContext)
        {
            _logger = logger;
            _localizationService = localizationService;
            _coreHelper = coreHelper;
            _dbContext = dbContext;
        }

        public async Task<OperationDataResult<Stream>> GenerateWordDashboard(List<ReportEformModel> reportModel)
        {
            try
            {
                // get core
                var core = await _coreHelper.GetCore();
                var headerImageName = _dbContext.PluginConfigurationValues.Single(x => x.Name == "ItemsPlanningBaseSettings:ReportImageName").Value;

                _s3Enabled = core.GetSdkSetting(Settings.s3Enabled).Result.ToLower() == "true";
                _swiftEnabled = core.GetSdkSetting(Settings.swiftEnabled).Result.ToLower() == "true";
                // Read html and template
                var resourceString = "ItemsPlanning.Pn.Resources.Templates.WordExport.page.html";
                var assembly = Assembly.GetExecutingAssembly();
                var resourceStream = assembly.GetManifestResourceStream(resourceString);
                string html;
                using (var reader = new StreamReader(resourceStream ?? throw new InvalidOperationException($"{nameof(resourceStream)} is null")))
                {
                    html = reader.ReadToEnd();
                }

                resourceString = "ItemsPlanning.Pn.Resources.Templates.WordExport.file.docx";
                var docxFileResourceStream = assembly.GetManifestResourceStream(resourceString);
                if (docxFileResourceStream == null)
                {
                    throw new InvalidOperationException($"{nameof(docxFileResourceStream)} is null");
                }
                var docxFileStream = new MemoryStream();
                await docxFileResourceStream.CopyToAsync(docxFileStream);
                string basePicturePath = await core.GetSdkSetting(Settings.fileLocationPicture);

                var word = new WordProcessor(docxFileStream);

                var itemsHtml = "";
                var header = _dbContext.PluginConfigurationValues.Single(x => x.Name == "ItemsPlanningBaseSettings:ReportHeaderName").Value;
                var subHeader = _dbContext.PluginConfigurationValues.Single(x => x.Name == "ItemsPlanningBaseSettings:ReportSubHeaderName").Value;
                itemsHtml += "<body>";
                itemsHtml += @"<table width=""100%"" border=""0"">";
                itemsHtml += @"<tr style=""background-color:white;"">";
                itemsHtml += $@"<td><div style='font-size: 24px;'>{header}</div><div style='font-size: 20px;'>{subHeader}</div>";
                itemsHtml += $@"<div style='font-size: 15px;'>{_localizationService.GetString("ReportPeriod")}: {reportModel.First().FromDate} - {reportModel.First().ToDate}</div></td>";
                itemsHtml += $@"<td rowscan='2'><div style='text-align: right;'>";
                if (!string.IsNullOrEmpty(headerImageName)) {
                    itemsHtml = await InsertImage(headerImageName, itemsHtml, 150, 150, core, basePicturePath);
                }
                itemsHtml += $@"</div></td>";
                itemsHtml += @"</tr>";
                itemsHtml += @"</table>";

                int i = 0;
                foreach (var reportEformModel in reportModel)
                {
                    if (!string.IsNullOrEmpty(reportEformModel.Name))
                    {
                        itemsHtml += $@"<h1><b>{reportEformModel.Name}</b></h1>";
                    }

                    itemsHtml += @"<table width=""100%"" border=""1"">";

                    // Table header
                    itemsHtml += @"<tr style=""background-color:#f5f5f5;font-weight:bold"">";
                    itemsHtml += $@"<td>{_localizationService.GetString("CaseId")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("CreatedAt")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("DoneBy")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("ItemName")}</td>";

                    foreach (var itemHeader in reportEformModel.ItemHeaders)
                    {
                        itemsHtml += $@"<td>{itemHeader.Value}</td>";
                    }

                    // itemsHtml += $@"<td>{_localizationService.GetString("Pictures")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("Posts")}</td>";
                    itemsHtml += @"</tr>";

                    foreach (var dataModel in reportEformModel.Items)
                    {
                        itemsHtml += @"<tr>";
                        itemsHtml += $@"<td>{dataModel.MicrotingSdkCaseId}</td>";

                        itemsHtml += $@"<td>{dataModel.MicrotingSdkCaseDoneAt:dd.MM.yyyy HH:mm:ss}</td>";
                        itemsHtml += $@"<td>{dataModel.DoneBy}</td>";
                        itemsHtml += $@"<td>{dataModel.ItemName}</td>";

                        foreach (var dataModelCaseField in dataModel.CaseFields)
                        {
                            itemsHtml += $@"<td>{dataModelCaseField}</td>";
                        }

                        // itemsHtml += $@"<td>{dataModel.ImagesCount}</td>";
                        itemsHtml += $@"<td>{dataModel.PostsCount}</td>";
                        itemsHtml += @"</tr>";
                    }
                    itemsHtml += @"</table>";

                    itemsHtml += @"<br/>";

                    foreach (var imagesName in reportEformModel.ImageNames)
                    {
                        itemsHtml += $@"<h2><b>{_localizationService.GetString("Picture")}: {imagesName.Key[1]}</b></h2>";

                        itemsHtml = await InsertImage(imagesName.Value[0], itemsHtml, 700, 650, core, basePicturePath);

                        if (!string.IsNullOrEmpty(imagesName.Value[1]))
                        {
                            itemsHtml += $@"<a href=""{imagesName.Value[1]}"">{imagesName.Value[1]}</a>";
                        }
                    }

                    itemsHtml += $@"<h2><b>{reportEformModel.Name} {_localizationService.GetString("posts")}</b></h2>";
                    itemsHtml += @"<table width=""100%"" border=""1"">";

                    // Table header
                    itemsHtml += @"<tr style=""background-color:#f5f5f5;font-weight:bold"">";
                    // itemsHtml += $@"<td>{_localizationService.GetString("Id")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("CaseId")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("PostDate")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("SentTo")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("Comment")}</td>";
                    itemsHtml += @"</tr>";

                    foreach (var dataModel in reportEformModel.Posts)
                    {
                        itemsHtml += @"<tr>";
                        // itemsHtml += $@"<td>{dataModel.PostId}</td>";
                        itemsHtml += $@"<td>{dataModel.CaseId}</td>";
                        itemsHtml += $@"<td>{dataModel.PostDate:dd.MM.yyyy HH:mm:ss}</td>";
                        itemsHtml += $@"<td>{dataModel.SentTo.Join()} {dataModel.SentToTags.Join()}</td>";
                        itemsHtml += $@"<td>{dataModel.Comment}</td>";
                        itemsHtml += @"</tr>";
                    }
                    itemsHtml += @"</table>";
                }

                itemsHtml += "</body>";

                html = html.Replace("{%ItemList%}", itemsHtml);

                word.AddHtml(html);
                word.Dispose();
                docxFileStream.Position = 0;
                return new OperationDataResult<Stream>(true, docxFileStream);
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                _logger.LogError(e.Message);
                return new OperationDataResult<Stream>(
                    false,
                    _localizationService.GetString("ErrorWhileCreatingWordFile"));
            }
        }

        private async Task<string> InsertImage(string imageName, string itemsHtml, int imageSize, int imageWidth, Core core, string basePicturePath)
        {
            var filePath = Path.Combine(basePicturePath, imageName);
            Stream stream;
            if (_swiftEnabled)
            {
                var storageResult = await core.GetFileFromSwiftStorage(imageName);
                stream = storageResult.ObjectStreamContent;
            } else if (_s3Enabled)
            {
                var storageResult = await core.GetFileFromS3Storage(imageName);
                stream = storageResult.ResponseStream;
            } else if (!File.Exists(filePath))
            {
                return null;
                // return new OperationDataResult<Stream>(
                //     false,
                //     _localizationService.GetString($"{imagesName} not found"));
            }
            else
            {
                stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
            }

            using (var image = new MagickImage(stream))
            {
                decimal currentRation = image.Height / (decimal)image.Width;
                int newWidth = imageSize;
                int newHeight = (int)Math.Round((currentRation * newWidth));

                image.Resize(newWidth, newHeight);
                image.Crop(newWidth, newHeight);

                var base64String = image.ToBase64();
                itemsHtml +=
                    $@"<p><img src=""data:image/png;base64,{base64String}"" width=""{imageWidth}px"" alt="""" /></p>";
            }

            await stream.DisposeAsync();

            return itemsHtml;
        }
    }
}
