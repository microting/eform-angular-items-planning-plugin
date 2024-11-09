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

using Microsoft.Extensions.Logging;
using Sentry;

namespace ItemsPlanning.Pn.Services.UploadedDataService;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Infrastructure.Models;
using ItemsPlanningLocalizationService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microting.eForm.Infrastructure.Constants;
using Microting.eFormApi.BasePn.Abstractions;
using Microting.eFormApi.BasePn.Infrastructure.Models.API;
using Microting.ItemsPlanningBase.Infrastructure.Data;
using Microting.ItemsPlanningBase.Infrastructure.Data.Entities;
using Settings = Microting.eForm.Dto.Settings;

public class UploadedDataService(
    ItemsPlanningPnDbContext dbContext,
    IItemsPlanningLocalizationService itemsPlanningLocalizationService,
    IEFormCoreService core,
    ILogger<UploadedDataService> logger)
    : IUploadedDataService
{
    public async Task<OperationDataResult<UploadedDatasModel>> Index(int itemCaseId)
    {

        try
        {
            UploadedDatasModel uploadedDatasModel = new UploadedDatasModel();

            IQueryable<UploadedData> uploadedDataQuery = dbContext.UploadedDatas.AsQueryable();

            uploadedDataQuery
                = uploadedDataQuery
                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed && x.PlanningCaseId == itemCaseId);

            List<UploadedDataModel> uploadedDatas = await uploadedDataQuery.Select(x => new UploadedDataModel()
            {
                Id = x.Id,
                Checksum = x.Checksum,
                CurrentFile = x.CurrentFile,
                Extension = x.Extension,
                FileLocation = x.FileLocation,
                FileName = x.FileName,
                PlanningCaseId = x.PlanningCaseId,
                UploaderType = x.UploaderType
            }).ToListAsync();

            uploadedDatasModel.Total =
                dbContext.UploadedDatas.Count(x => x.WorkflowState != Constants.WorkflowStates.Removed);
            uploadedDatasModel.UploadedDatas = uploadedDatas;

            return new OperationDataResult<UploadedDatasModel>(true, uploadedDatasModel);
        }
        catch (Exception e)
        {
            SentrySdk.CaptureException(e);
            logger.LogError(e.Message);
            logger.LogTrace(e.StackTrace);
            return new OperationDataResult<UploadedDatasModel>(false,
                itemsPlanningLocalizationService.GetString("ErrorObtainingUploadedDatas"));
        }
    }

    public async Task<OperationDataResult<UploadedDataModel>> Read(int selectedListItemCaseId)
    {
        try
        {
            UploadedDataModel uploadedDataModel = new UploadedDataModel();

            var uploadedData =
                await dbContext.UploadedDatas.FirstOrDefaultAsync(x => x.PlanningCaseId == selectedListItemCaseId);

            uploadedDataModel.Checksum = uploadedData.Checksum;
            uploadedDataModel.Extension = uploadedData.Extension;
            uploadedDataModel.CurrentFile = uploadedData.CurrentFile;
            uploadedDataModel.FileLocation = uploadedData.FileLocation;
            uploadedDataModel.FileName = uploadedData.FileName;
            uploadedDataModel.UploaderType = uploadedData.UploaderType;
            uploadedDataModel.PlanningCaseId = uploadedData.PlanningCaseId;

            return new OperationDataResult<UploadedDataModel>(true, uploadedDataModel);
        }
        catch (Exception e)
        {
            SentrySdk.CaptureException(e);
            logger.LogError(e.Message);
            logger.LogTrace(e.StackTrace);
            return new OperationDataResult<UploadedDataModel>(false,
                itemsPlanningLocalizationService.GetString($"ErrorObtainingUploadedDataWithItemCaseID:{selectedListItemCaseId}"));
        }

    }

    public async Task<OperationResult> Update(UploadedDataModel uploadedDataModel)
    {

        UploadedData uploadedData =
            await dbContext.UploadedDatas.SingleOrDefaultAsync(x => x.Id == uploadedDataModel.Id);

        if (uploadedData != null)
        {
            uploadedData.Checksum = uploadedDataModel.Checksum;
            uploadedData.Extension = uploadedDataModel.Extension;
            uploadedData.CurrentFile = uploadedDataModel.CurrentFile;
            uploadedData.FileLocation = uploadedDataModel.FileLocation;
            uploadedData.FileName = uploadedDataModel.FileName;
            uploadedData.UploaderType = uploadedDataModel.UploaderType;
            uploadedData.PlanningCaseId = uploadedDataModel.PlanningCaseId;

            await uploadedData.Update(dbContext);
            return new OperationResult(true);
        }
        return new OperationResult(false);
    }

    public async Task<OperationResult> Delete(int id)
    {
        UploadedData uploadedData =
            await dbContext.UploadedDatas.SingleOrDefaultAsync(x => x.Id == id);

        if (uploadedData != null)
        {
            await uploadedData.Delete(dbContext);
            return new OperationResult(true);
        }
        return new OperationResult(false);
    }

    public async Task<IActionResult> UploadUploadedDataPdf(UploadedDataPDFUploadModel pdfUploadModel)
    {
        try
        {
            var core1 =core.GetCore();

            var saveFolder = Path.Combine(await core1.Result.GetSdkSetting(Settings.fileLocationPdf), Path.Combine("pdfFiles"));

            Directory.CreateDirectory(saveFolder);

            var fileName = $"ItemCase_{pdfUploadModel.ItemCaseId}_{DateTime.Now.Ticks}.pdf";

            if (pdfUploadModel.File.Length > 0)
            {
                await using var stream = new FileStream(Path.Combine(saveFolder, fileName), FileMode.Create);
                await pdfUploadModel.File.CopyToAsync(stream);
            }
            if (core1.Result.GetSdkSetting(Settings.swiftEnabled).ToString().ToLower() == "true")
            {
                await core1.Result.PutFileToStorageSystem(Path.Combine(saveFolder, fileName), fileName);
            }

            var uploadedData = new UploadedData
            {
                FileLocation = saveFolder,
                FileName = fileName,
                PlanningCaseId = pdfUploadModel.ItemCaseId
            };

            await uploadedData.Create(dbContext);


            return new OkResult();

        }
        catch (Exception e)
        {
            SentrySdk.CaptureException(e);
            logger.LogError(e.Message);
            logger.LogTrace(e.StackTrace);
            return new BadRequestResult();
        }
    }

    public async Task<IActionResult> DownloadUploadedDataPdf(string fileName)
    {
        var core1 = core.GetCore();
        var filePath = Path.Combine(core1.Result.GetSdkSetting(Settings.fileLocationPdf) + "pdfFiles/", fileName);
        const string fileType = "application/pdf";

        if (core1.Result.GetSdkSetting(Settings.s3Enabled).ToString().ToLower() == "true")
        {
            var ss = await core1.Result.GetFileFromS3Storage(fileName);

            if (ss == null)
            {
                return new NotFoundResult();
            }
            return new OkObjectResult(ss);
        }

        byte[] fileBytes;

        if (File.Exists(filePath))
        {
            fileBytes = File.ReadAllBytes(filePath);
        }
        else
        {
            return new NotFoundResult();
        }

        return new FileContentResult(fileBytes, fileType)
        {
            FileDownloadName = fileName
        };
    }
}