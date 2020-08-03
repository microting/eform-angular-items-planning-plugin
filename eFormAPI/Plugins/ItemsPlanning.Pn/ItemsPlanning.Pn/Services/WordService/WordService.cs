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
namespace ItemsPlanning.Pn.Services.WordService
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Drawing;
    using System.IO;
    using System.Reflection;
    using System.Threading.Tasks;
    using Infrastructure.Models.Report;
    using ItemsPlanningLocalizationService;
    using Microsoft.Extensions.Logging;
    using Microting.eForm.Dto;
    using Microting.eFormApi.BasePn.Abstractions;
    using Microting.eFormApi.BasePn.Infrastructure.Models.API;

    public class WordService : IWordService
    {
        private readonly ILogger<WordService> _logger;
        private readonly IItemsPlanningLocalizationService _localizationService;
        private readonly IEFormCoreService _coreHelper;

        public WordService(
            ILogger<WordService> logger,
            IItemsPlanningLocalizationService localizationService,
            IEFormCoreService coreHelper)
        {
            _logger = logger;
            _localizationService = localizationService;
            _coreHelper = coreHelper;
        }

        public async Task<OperationDataResult<Stream>> GenerateWordDashboard(List<ReportEformModel> reportModel)
        {
            try
            {
                // get core
                var core = await _coreHelper.GetCore();

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

                var word = new WordProcessor(docxFileStream);

                var itemsHtml = "";

                foreach (var reportEformModel in reportModel)
                {
                    if (!string.IsNullOrEmpty(reportEformModel.Name))
                    {
                        itemsHtml += $@"<p><b>{reportEformModel.Name}</b></p>";
                    }

                    itemsHtml += @"<br/>";
                    itemsHtml += @"<table width=""100%"" border=""1"">";

                    // Table header
                    itemsHtml += @"<tr style=""background-color:#f5f5f5;font-weight:bold"">";
                    itemsHtml += $@"<td>{_localizationService.GetString("Id")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("CreatedAt")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("DoneBy")}</td>";

                    foreach (var itemHeader in reportEformModel.ItemHeaders)
                    {
                        itemsHtml += $@"<td>{itemHeader}</td>";
                    }

                    itemsHtml += $@"<td>{_localizationService.GetString("Pictures")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("Posts")}</td>";
                    itemsHtml += @"</tr>";

                    foreach (var dataModel in reportEformModel.Items)
                    {
                        itemsHtml += @"<tr>";
                        itemsHtml += $@"<td>{dataModel.Id}</td>";

                        itemsHtml += $@"<td>{dataModel.CreatedAt:dd-MM-yyyy}</td>";
                        itemsHtml += $@"<td>{dataModel.DoneBy}</td>";

                        foreach (var dataModelCaseField in dataModel.CaseFields)
                        {
                            itemsHtml += $@"<td>{dataModelCaseField}</td>";
                        }

                        itemsHtml += $@"<td>{dataModel.ImagesCount}</td>";
                        itemsHtml += $@"<td>{dataModel.PostsCount}</td>";
                        itemsHtml += @"</tr>";
                    }
                    itemsHtml += @"</table>";

                    itemsHtml += @"<br/>";

                    itemsHtml += $@"<p><b>{reportEformModel.Name} Images</b></p>";
                    foreach (var imagesName in reportEformModel.ImagesNames)
                    {
                        itemsHtml += $@"<p><b>{imagesName}</b></p>";

                        var filePath = Path.Combine(await core.GetSdkSetting(Settings.fileLocationPicture), imagesName);

                        Stream stream;
                        if (core.GetSdkSetting(Settings.swiftEnabled).Result.ToLower() == "true")
                        {
                            var storageResult = await core.GetFileFromSwiftStorage(imagesName);
                            stream = storageResult.ObjectStreamContent;
                        } else if (core.GetSdkSetting(Settings.s3Enabled).Result.ToLower() == "true")
                        {
                            var storageResult = await core.GetFileFromS3Storage(imagesName);
                            stream = storageResult.ResponseStream;
                        } else if (!File.Exists(filePath))
                        {
                            return new OperationDataResult<Stream>(
                                false,
                                _localizationService.GetString($"{imagesName} not found"));
                        }
                        else
                        {
                            stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                        }

                        using (var image = Image.FromStream(stream))
                        {
                            using (var memoryStream = new MemoryStream())
                            {
                                image.Save(memoryStream, image.RawFormat);
                                var imageBytes = memoryStream.ToArray();

                                // Convert byte[] to Base64 String
                                var base64String = Convert.ToBase64String(imageBytes);
                                itemsHtml +=
                                    $@"<p><img src=""data:image/png;base64,{base64String}"" width=""650px"" alt=""Image"" /></p>";
                            }
                        }

                        stream.Dispose();
                    }

                    itemsHtml += @"<br/>";

                    itemsHtml += $@"<p><b>{reportEformModel.Name} posts</b></p>";
                    itemsHtml += @"<table width=""100%"" border=""1"">";

                    // Table header
                    itemsHtml += @"<tr style=""background-color:#f5f5f5;font-weight:bold"">";
                    itemsHtml += $@"<td>{_localizationService.GetString("Id")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("CaseId")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("SentTo")}</td>";
                    itemsHtml += $@"<td>{_localizationService.GetString("Comment")}</td>";
                    itemsHtml += @"</tr>";

                    foreach (var dataModel in reportEformModel.Posts)
                    {
                        itemsHtml += @"<tr>";
                        itemsHtml += $@"<td>{dataModel.PostId}</td>";
                        itemsHtml += $@"<td>{dataModel.CaseId}</td>";
                        itemsHtml += $@"<td>{dataModel.SentTo}</td>";
                        itemsHtml += $@"<td>{dataModel.Comment}</td>";
                        itemsHtml += @"</tr>";
                    }
                    itemsHtml += @"</table>";
                }

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
    }
}
