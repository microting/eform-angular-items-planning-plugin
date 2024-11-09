/*
The MIT License (MIT)

Copyright (c) 2007 - 2021 Microting A/S

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

using System.Text;
using Sentry;

namespace ItemsPlanning.Pn.Services.WordService;

using eFormCore;
using ImageMagick;
using Microting.ItemsPlanningBase.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Infrastructure.Models.Report;
using ItemsPlanningLocalizationService;
using Microsoft.Extensions.Logging;
using Microting.eForm.Dto;
using Microting.eFormApi.BasePn.Abstractions;
using Microting.eFormApi.BasePn.Infrastructure.Models.API;

public class WordService(
    ILogger<WordService> logger,
    IItemsPlanningLocalizationService localizationService,
    IEFormCoreService coreHelper,
    ItemsPlanningPnDbContext dbContext)
    : IWordService
{
    private bool _s3Enabled;

    public async Task<OperationDataResult<Stream>> GenerateWordDashboard(List<ReportEformModel> reportModel)
    {
        try
        {
            // get core
            var core = await coreHelper.GetCore();
            var headerImageName = dbContext.PluginConfigurationValues.Single(x => x.Name == "ItemsPlanningBaseSettings:ReportImageName").Value;

            _s3Enabled = core.GetSdkSetting(Settings.s3Enabled).Result.ToLower() == "true";
            // Read html and template
            var resourceString = "ItemsPlanning.Pn.Resources.Templates.WordExport.page.html";
            var assembly = Assembly.GetExecutingAssembly();
            var resourceStream = assembly.GetManifestResourceStream(resourceString);
            string html;
            using (var reader = new StreamReader(resourceStream ?? throw new InvalidOperationException($"{nameof(resourceStream)} is null")))
            {
                html = await reader.ReadToEndAsync();
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

            var itemsHtml = new StringBuilder();;
            var header = dbContext.PluginConfigurationValues.Single(x => x.Name == "ItemsPlanningBaseSettings:ReportHeaderName").Value;
            var subHeader = dbContext.PluginConfigurationValues.Single(x => x.Name == "ItemsPlanningBaseSettings:ReportSubHeaderName").Value;
            itemsHtml.Append("<body>");
            itemsHtml.Append(@"<p style='display:flex;align-content:center;justify-content:center;flex-wrap:wrap;'>");
            for (var i = 0; i < 8; i++)
            {
                itemsHtml.Append(@"<p style='font-size:24px;text-align:center;color:#fff;'>Enter</p>");
            }
            itemsHtml.Append($@"<p style='font-size:24px;text-align:center;'>{header}</p>");
            itemsHtml.Append($@"<p style='font-size:20px;text-align:center;'>{subHeader}</p>");
            itemsHtml.Append($@"<p style='font-size:15px;text-align:center;'>{localizationService.GetString("ReportPeriod")}: {reportModel.First().FromDate} - {reportModel.First().ToDate}</p>");

            itemsHtml.Append(@"</p>");

            // moving the cursor to the end of the page
            for (var i = 0; i < 5; i++)
            {
                itemsHtml.Append(@"<p style='font-size:24px;text-align:center;color:#fff;'>Enter</p>");
            }
            // add tag names in end document
            foreach (var nameTage in reportModel.Last().NameTagsInEndPage)
            {
                itemsHtml.Append($@"<p style='font-size:24px;text-align:center;'>{nameTage}</p>");
            }
            itemsHtml.Append(@"<div style='page-break-before:always;'>");
            for (var i = 0; i < reportModel.Count; i++)
            {
                var reportEformModel = reportModel[i];
                if (reportEformModel.TextHeaders != null)
                {
                    if (!string.IsNullOrEmpty(reportEformModel.TextHeaders.Header1))
                    {
                        itemsHtml.Append($@"<h1>{Regex.Replace(reportEformModel.TextHeaders.Header1, @"\. ", ".")}</h1>");
                        // We do this, even thought some would look at it and find it looking stupid. But if we don't do it,
                        // Word WILL mess up the header titles, because it thinks it needs to fix the number order.
                    }

                    if (!string.IsNullOrEmpty(reportEformModel.TextHeaders.Header2))
                    {
                        itemsHtml.Append($@"<h2>{reportEformModel.TextHeaders.Header2}</h2>");
                    }

                    if (!string.IsNullOrEmpty(reportEformModel.TextHeaders.Header3))
                    {
                        itemsHtml.Append($@"<h3>{reportEformModel.TextHeaders.Header3}</h3>");
                    }

                    if (!string.IsNullOrEmpty(reportEformModel.TextHeaders.Header4))
                    {
                        itemsHtml.Append($@"<h4>{reportEformModel.TextHeaders.Header4}</h4>");
                    }

                    if (!string.IsNullOrEmpty(reportEformModel.TextHeaders.Header5))
                    {
                        itemsHtml.Append($@"<h5>{reportEformModel.TextHeaders.Header5}</h5>");
                    }
                }

                foreach (var description in reportEformModel.DescriptionBlocks)
                {
                    itemsHtml.Append($@"<p style='font-size: 7pt;'>{description}</p>");
                }

                if (reportEformModel.Items.Any())
                {
                    itemsHtml.Append(@"<table width=""100%"" border=""1"">"); // TODO change font-size 7

                    // Table header
                    itemsHtml.Append(@"<tr style='background-color:#f5f5f5;font-weight:bold;font-size: 7pt;'>");
                    itemsHtml.Append($@"<td>{localizationService.GetString("Id")}</td>");
                    itemsHtml.Append($@"<td>{localizationService.GetString("CreatedAt")}</td>");
                    itemsHtml.Append($@"<td>{localizationService.GetString("DoneBy")}</td>");
                    itemsHtml.Append($@"<td>{localizationService.GetString("ItemName")}</td>");

                    foreach (var itemHeader in reportEformModel.ItemHeaders)
                    {
                        itemsHtml.Append($@"<td>{itemHeader.Value}</td>");
                    }

                    itemsHtml.Append(@"</tr>");

                    foreach (var dataModel in reportEformModel.Items)
                    {
                        itemsHtml.Append(@"<tr style='font-size: 7pt;'>");
                        itemsHtml.Append($@"<td>{dataModel.MicrotingSdkCaseId}</td>");

                        itemsHtml.Append($@"<td>{dataModel.MicrotingSdkCaseDoneAt:dd.MM.yyyy}</td>");
                        itemsHtml.Append($@"<td>{dataModel.DoneBy}</td>");
                        itemsHtml.Append($@"<td>{dataModel.ItemName}</td>");

                        foreach (var dataModelCaseField in dataModel.CaseFields)
                        {
                            if (dataModelCaseField.Value == "checked")
                            {
                                itemsHtml.Append($@"<td>&#10004;</td>");
                            }
                            else
                            {
                                if (dataModelCaseField.Value == "unchecked")
                                {
                                    itemsHtml.Append($@"<td></td>");
                                } else
                                {
                                    itemsHtml.Append(dataModelCaseField.Key == "number"
                                        ? $@"<td>{dataModelCaseField.Value.Replace(".", ",")}</td>"
                                        : $@"<td>{dataModelCaseField.Value}</td>");
                                }
                            }
                        }

                        itemsHtml.Append(@"</tr>");
                    }

                    itemsHtml.Append(@"</table>");
                }

                itemsHtml.Append(@"<br/>");

                foreach (var imagesName in reportEformModel.ImageNames)
                {
                    itemsHtml.Append($@"<p style='font-size: 7pt; page-break-before:always'>{localizationService.GetString("Id")}: {imagesName.Key[1]}</p>"); // TODO change to ID: {id}; imagesName.Key[1]

                    itemsHtml = await InsertImage(imagesName.Value[0], itemsHtml, 700, 650, core, basePicturePath);

                    if (!string.IsNullOrEmpty(imagesName.Value[1]))
                    {
                        itemsHtml.Append($@"<p style='font-size: 7pt;'>{localizationService.GetString("Position")}:<a href=""{imagesName.Value[1]}"">{imagesName.Value[1]}</a></p>"); // TODO change to Position : URL
                    }
                }
            }


            itemsHtml.Append(@"</div>");
            itemsHtml.Append("</body>");

            html = html.Replace("{%ItemList%}", itemsHtml.ToString());

            word.AddHtml(html);
            word.Dispose();
            docxFileStream.Position = 0;
            return new OperationDataResult<Stream>(true, docxFileStream);
        }
        catch (Exception e)
        {
            SentrySdk.CaptureException(e);
            logger.LogError(e.Message);
            logger.LogTrace(e.StackTrace);
            return new OperationDataResult<Stream>(
                false,
                localizationService.GetString("ErrorWhileCreatingWordFile"));
        }
    }

    private async Task<StringBuilder> InsertImage(string imageName, StringBuilder itemsHtml, int imageSize, int imageWidth, Core core, string basePicturePath)
    {
        var filePath = Path.Combine(basePicturePath, imageName);
        Stream stream;
        if (_s3Enabled)
        {
            var storageResult = await core.GetFileFromS3Storage(imageName);
            stream = storageResult.ResponseStream;
        } else if (!File.Exists(filePath))
        {
            return null;
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

            image.Resize((uint)newWidth, (uint)newHeight);
            image.Crop((uint)newWidth, (uint)newHeight);

            var base64String = image.ToBase64();
            itemsHtml.Append($@"<p><img src=""data:image/png;base64,{base64String}"" width=""{imageWidth}px"" alt="""" /></p>");
        }

        await stream.DisposeAsync();

        return itemsHtml;
    }
}