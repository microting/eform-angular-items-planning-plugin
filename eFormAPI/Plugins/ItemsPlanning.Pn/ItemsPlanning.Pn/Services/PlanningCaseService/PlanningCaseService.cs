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

namespace ItemsPlanning.Pn.Services.PlanningCaseService
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;
    using System.Xml.Linq;
    using Infrastructure.Models;
    using ItemsPlanningLocalizationService;
    using Microsoft.EntityFrameworkCore;
    using Microting.eForm.Dto;
    using Microting.eForm.Infrastructure.Constants;
    using Microting.eFormApi.BasePn.Abstractions;
    using Microting.eFormApi.BasePn.Infrastructure.Database.Entities;
    using Microting.eFormApi.BasePn.Infrastructure.Extensions;
    using Microting.eFormApi.BasePn.Infrastructure.Helpers;
    using Microting.eFormApi.BasePn.Infrastructure.Models.API;
    using Microting.ItemsPlanningBase.Infrastructure.Data;
    using Microting.ItemsPlanningBase.Infrastructure.Data.Entities;

    public class PlanningCaseService :IPlanningCaseService
    {
        private readonly ItemsPlanningPnDbContext _dbContext;
        private readonly IItemsPlanningLocalizationService _itemsPlanningLocalizationService;
        private readonly IEFormCoreService _core;

        public PlanningCaseService(
            ItemsPlanningPnDbContext dbContext,
            IItemsPlanningLocalizationService itemsPlanningLocalizationService,
            IEFormCoreService core)
        {
            _dbContext = dbContext;
            _itemsPlanningLocalizationService = itemsPlanningLocalizationService;
            _core = core;
        }

        public async Task<OperationDataResult<PlanningCasesModel>> GetSinglePlanningCase(PlanningCasesPnRequestModel requestModel)
        {
            try
            {

                var newItems = (_dbContext.Items.Where(item => item.PlanningId == requestModel.PlanningId)
                    .Join(_dbContext.PlanningCases, item => item.Id, itemCase => itemCase.ItemId,
                        (item, itemCase) => new
                        {
                            itemCase.Id,
                            item.Name,
                            item.Description,
                            item.Type,
                            item.BuildYear,
                            item.ItemNumber,
                            itemCase.Comment,
                            itemCase.Location,
                            itemCase.FieldStatus,
                            itemCase.NumberOfImages,
                            itemCase.WorkflowState,
                            itemCase.CreatedAt,
                            itemCase.MicrotingSdkCaseId,
                            itemCase.MicrotingSdkeFormId,
                            itemCase.Status
                        }));

                if (!string.IsNullOrEmpty(requestModel.Sort))
                {
                    if (requestModel.IsSortDsc)
                    {
                        newItems = newItems
                            .CustomOrderByDescending(requestModel.Sort);
                    }
                    else
                    {
                        newItems = newItems
                            .CustomOrderBy(requestModel.Sort);
                    }
                }
                else
                {
                    newItems = newItems
                        .OrderBy(x => x.Id);
                }


                newItems
                    = newItems
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .Skip(requestModel.Offset)
                        .Take(requestModel.PageSize);
                
                if (newItems.Any())
                {
                    
                    PlanningCasesModel itemsListCasePnModel = new PlanningCasesModel();
                    itemsListCasePnModel.Items = await newItems.Select(x => new PlanningItemCaseModel()
                    {
                        Id = x.Id,
                        Date = x.CreatedAt,
                        CreatedAt = x.CreatedAt,
                        Name = x.Name,
                        ItemNumber = x.ItemNumber,
                        BuildYear = x.BuildYear,
                        Description = x.Description,
                        Type = x.Type,
                        Comment = x.Comment,
                        Location = x.Location,
                        FieldStatus = x.FieldStatus,
                        NumberOfImages = x.NumberOfImages,
                        SdkCaseId = x.MicrotingSdkCaseId,
                        SdkeFormId = x.MicrotingSdkeFormId,
                        Status = x.Status
                    }).ToListAsync();
                    
                    itemsListCasePnModel.Total = await (_dbContext.Items.Where(item => item.PlanningId == requestModel.PlanningId)
                        .Join(_dbContext.PlanningCases, item => item.Id, itemCase => itemCase.ItemId,
                            (item, itemCase) => new
                            {
                                itemCase.Id
                            })).CountAsync();

                    return new OperationDataResult<PlanningCasesModel>(
                        true,
                        itemsListCasePnModel);
                }
                else
                {
                    return new OperationDataResult<PlanningCasesModel>(
                        false, "");
                }
            }
            catch (Exception ex)
            {
                return new OperationDataResult<PlanningCasesModel>(
                    false, ex.Message);
            }
        }

        public async Task<OperationDataResult<PlanningCaseResultListModel>> GetSingleCaseResults(PlanningCasesPnRequestModel requestModel)
        {
            PlanningCaseResultListModel itemListPnCaseResultListModel = await GetTableData(requestModel);
            
            return new OperationDataResult<PlanningCaseResultListModel>(true, itemListPnCaseResultListModel);
        }

        private async Task<PlanningCaseResultListModel> GetTableData(PlanningCasesPnRequestModel requestModel)
        {
            PluginConfigurationValue pluginConfigurationValue =
                await _dbContext.PluginConfigurationValues.SingleOrDefaultAsync(x => x.Name == "ItemsPlanningBaseSettings:Token");
            
            var planning = await _dbContext.Plannings.SingleOrDefaultAsync(x => x.Id == requestModel.PlanningId);

            List<FieldDto> allFields = await _core.GetCore().Result.Advanced_TemplateFieldReadAll(planning.RelatedEFormId);

            int i = 0;
            List<int> toBeRemoved = new List<int>();
            foreach (FieldDto field in allFields)
            {
                if (field.FieldType == Constants.FieldTypes.SaveButton)
                {
                    toBeRemoved.Add(i);
                }

                i += 1;
            }

            foreach (int i1 in toBeRemoved)
            {
                allFields.RemoveAt(i1);
            }

            var itemListPnCaseResultListModel = new PlanningCaseResultListModel
            {
                Total = 0,
                LabelEnabled = planning.LabelEnabled,
                DescriptionEnabled = planning.DescriptionEnabled,
                DeployedAtEnabled = planning.DeployedAtEnabled,
                DoneAtEnabled = planning.DoneAtEnabled,
                DoneByUserNameEnabled = planning.DoneByUserNameEnabled,
                UploadedDataEnabled = planning.UploadedDataEnabled,
                ItemNumberEnabled = planning.ItemNumberEnabled,
                LocationCodeEnabled = planning.LocationCodeEnabled,
                BuildYearEnabled = planning.BuildYearEnabled,
                TypeEnabled = planning.TypeEnabled,
                NumberOfImagesEnabled = planning.NumberOfImagesEnabled,
                SdkeFormId = planning.RelatedEFormId,
                FieldEnabled1 = planning.SdkFieldEnabled1
            };

            if ( itemListPnCaseResultListModel.FieldEnabled1)
                itemListPnCaseResultListModel.FieldName1 = allFields.SingleOrDefault(x => x.Id == planning.SdkFieldId1)?.Label;
            
            itemListPnCaseResultListModel.FieldEnabled2 = planning.SdkFieldEnabled2;
            if (itemListPnCaseResultListModel.FieldEnabled2)
                itemListPnCaseResultListModel.FieldName2 = allFields.SingleOrDefault(x => x.Id == planning.SdkFieldId2)?.Label;
            
            itemListPnCaseResultListModel.FieldEnabled3 = planning.SdkFieldEnabled3;
            if (itemListPnCaseResultListModel.FieldEnabled3)
                itemListPnCaseResultListModel.FieldName3 = allFields.SingleOrDefault(x => x.Id == planning.SdkFieldId3)?.Label;
            
            itemListPnCaseResultListModel.FieldEnabled4 = planning.SdkFieldEnabled4;
            if (itemListPnCaseResultListModel.FieldEnabled4)
                itemListPnCaseResultListModel.FieldName4 = allFields.SingleOrDefault(x => x.Id == planning.SdkFieldId4)?.Label;
            
            itemListPnCaseResultListModel.FieldEnabled5 = planning.SdkFieldEnabled5;
            if (itemListPnCaseResultListModel.FieldEnabled5)
                itemListPnCaseResultListModel.FieldName5 = allFields.SingleOrDefault(x => x.Id == planning.SdkFieldId5)?.Label;
            
            itemListPnCaseResultListModel.FieldEnabled6 = planning.SdkFieldEnabled6;
            if (itemListPnCaseResultListModel.FieldEnabled6)
                itemListPnCaseResultListModel.FieldName6 = allFields.SingleOrDefault(x => x.Id == planning.SdkFieldId6)?.Label;
            
            itemListPnCaseResultListModel.FieldEnabled7 = planning.SdkFieldEnabled7;
            if (itemListPnCaseResultListModel.FieldEnabled7)
                itemListPnCaseResultListModel.FieldName7 = allFields.SingleOrDefault(x => x.Id == planning.SdkFieldId7)?.Label;
            
            itemListPnCaseResultListModel.FieldEnabled8 = planning.SdkFieldEnabled8;
            if (itemListPnCaseResultListModel.FieldEnabled8)
                itemListPnCaseResultListModel.FieldName8 = allFields.SingleOrDefault(x => x.Id == planning.SdkFieldId8)?.Label;
            
            itemListPnCaseResultListModel.FieldEnabled9 = planning.SdkFieldEnabled9;
            if (itemListPnCaseResultListModel.FieldEnabled9)
                itemListPnCaseResultListModel.FieldName9 = allFields.SingleOrDefault(x => x.Id == planning.SdkFieldId9)?.Label;
            
            itemListPnCaseResultListModel.FieldEnabled10 = planning.SdkFieldEnabled10;
            if (itemListPnCaseResultListModel.FieldEnabled10)
                itemListPnCaseResultListModel.FieldName10 = allFields.SingleOrDefault(x => x.Id == planning.SdkFieldId10)?.Label;
            
            var newItems = (_dbContext.Items.Where(item => item.PlanningId == requestModel.PlanningId)
                .Join(_dbContext.PlanningCases, item => item.Id, itemCase => itemCase.ItemId,
                    (item, itemCase) => new
                    {
                        itemCase.Id,
                        item.Name,
                        item.Description,
                        item.BuildYear,
                        item.LocationCode,
                        item.ItemNumber,
                        item.Type,
                        itemCase.MicrotingSdkCaseDoneAt,
                        itemCase.MicrotingSdkCaseId,
                        itemCase.Status,
                        itemCase.CreatedAt,
                        itemCase.DoneByUserName,
                        itemCase.SdkFieldValue1,
                        itemCase.SdkFieldValue2,
                        itemCase.SdkFieldValue3,
                        itemCase.SdkFieldValue4,
                        itemCase.SdkFieldValue5,
                        itemCase.SdkFieldValue6,
                        itemCase.SdkFieldValue7,
                        itemCase.SdkFieldValue8,
                        itemCase.SdkFieldValue9,
                        itemCase.SdkFieldValue10,
                        itemCase.WorkflowState,
                        itemCase.NumberOfImages
                    }));

            if (requestModel.DateFrom != null)
            {
                newItems = newItems.Where(x => 
                    x.CreatedAt >= new DateTime(requestModel.DateFrom.Value.Year, requestModel.DateFrom.Value.Month, requestModel.DateFrom.Value.Day, 0, 0, 0));
            }

            if (requestModel.DateTo != null)
            {
                newItems = newItems.Where(x => 
                    x.CreatedAt <= new DateTime(requestModel.DateTo.Value.Year, requestModel.DateTo.Value.Month, requestModel.DateTo.Value.Day, 23, 59, 59));
            }
            
            if (!string.IsNullOrEmpty(requestModel.Sort))
            {
                if (requestModel.IsSortDsc)
                {
                    newItems = newItems
                        .CustomOrderByDescending(requestModel.Sort);
                }
                else
                {
                    newItems = newItems
                        .CustomOrderBy(requestModel.Sort);
                }
            }
            else
            {
                newItems = newItems
                    .OrderBy(x => x.Id);
            }
            
            itemListPnCaseResultListModel.Total = newItems.Count(x => x.WorkflowState != Constants.WorkflowStates.Removed);

            newItems
                = newItems
                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                    .Skip(requestModel.Offset)
                    .Take(requestModel.PageSize);

            itemListPnCaseResultListModel.Items = new List<PlanningCaseResultModel>();
            
            foreach (var item in newItems.ToList())
            {
                Console.WriteLine($"[DBG] ItemListCaseService.GetSingleListResults: Looking at case with id {item.Id} with status {item.Status}");

                try
                {
                    PlanningCaseResultModel newItem = new PlanningCaseResultModel()
                    {
                        Id = item.Id,
                        DoneAt = item.MicrotingSdkCaseDoneAt,
                        DeployedAt = item.CreatedAt,
                        DoneByUserName = item.DoneByUserName,
                        Label = item.Name,
                        Description = item.Description,
                        ItemNumber = item.ItemNumber,
                        LocationCode = item.LocationCode,
                        BuildYear = item.BuildYear,
                        Type = item.Type,
                        NumberOfImages = item.NumberOfImages,
                        Field1 = item.SdkFieldValue1,
                        Field2 = item.SdkFieldValue2,
                        Field3 = item.SdkFieldValue3,
                        Field4 = item.SdkFieldValue4,
                        Field5 = item.SdkFieldValue5,
                        Field6 = item.SdkFieldValue6,
                        Field7 = item.SdkFieldValue7,
                        Field8 = item.SdkFieldValue8,
                        Field9 = item.SdkFieldValue9,
                        Field10 = item.SdkFieldValue10,
                        SdkCaseId = item.MicrotingSdkCaseId,
                        SdkeFormId = planning.RelatedEFormId,
                        Status = item.Status,
                        Token = pluginConfigurationValue.Value
                    };
                    itemListPnCaseResultListModel.Items.Add(newItem);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
            }

            return itemListPnCaseResultListModel;
        }

        public async Task<OperationDataResult<PlanningItemCaseModel>> GetSingleCase(int caseId)
        {
            try
            {
                PlanningItemCaseModel itemCaseModel = new PlanningItemCaseModel();

                var itemCase = await _dbContext.PlanningCases.FirstOrDefaultAsync(x => x.Id == caseId);
                var item = await _dbContext.Items.FirstOrDefaultAsync(x => x.Id == itemCase.ItemId);
                
                                
                itemCaseModel.Id = itemCase.Id;
                itemCaseModel.Comment = itemCase.Comment;
                itemCaseModel.Status = itemCase.Status;
                itemCaseModel.NumberOfImages = itemCase.NumberOfImages;
                itemCaseModel.Location = itemCase.Location;
                itemCaseModel.Description = item.Description;
                itemCaseModel.ItemNumber = item.ItemNumber;
                itemCaseModel.BuildYear = item.BuildYear;
                itemCaseModel.Type = item.Type;
//                
//                if (itemCaseModel == null)
//                {
//                    return new OperationDataResult<ItemsListPnItemCaseModel>(false,
//                        _itemsPlanningLocalizationService.GetString(($"ListItemCase with ID: {caseId} does not exist")));
//                }
                return new OperationDataResult<PlanningItemCaseModel>(true, itemCaseModel);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
            return new OperationDataResult<PlanningItemCaseModel>(false, "Not done yet.");
        }

        public async Task<string> DownloadEFormPdf(int caseId, string token, string fileType)
        {
            PluginConfigurationValue pluginConfigurationValue =
                await _dbContext.PluginConfigurationValues.SingleOrDefaultAsync(x => x.Name == "ItemsPlanningBaseSettings:Token");
            if (token == pluginConfigurationValue.Value)
            {
                try
                {
                    var core = _core.GetCore();
                    int eFormId = 0;
                    PlanningCase itemCase = await _dbContext.PlanningCases.FirstOrDefaultAsync(x => x.Id == caseId);
                    Item item = await _dbContext.Items.SingleOrDefaultAsync(x => x.Id == itemCase.ItemId);
                    Planning itemList = await _dbContext.Plannings.SingleOrDefaultAsync(x => x.Id == item.PlanningId);
                    if (itemList != null)
                    {
                        eFormId = itemList.RelatedEFormId;    
                    }

                    string xmlContent = new XElement("ItemCase", 
                        new XElement("ItemId", item.Id), 
                        new XElement("ItemNumber", item.ItemNumber),
                        new XElement("ItemName", item.Name),  
                        new XElement("ItemDescription", item.Description), 
                        new XElement("ItemLocationCode", item.LocationCode),
                        new XElement("ItemBuildYear", item.BuildYear),
                        new XElement("ItemType", item.Type)
                    ).ToString();

                    if (caseId != 0 && eFormId != 0)
                    {
                        var filePath = await core.Result.CaseToPdf(itemCase.MicrotingSdkCaseId, eFormId.ToString(),
                            DateTime.Now.ToString("yyyyMMddHHmmssffff"),
                            $"{core.Result.GetSdkSetting(Settings.httpServerAddress)}/" + "api/template-files/get-image/", fileType, xmlContent);
                        if (!System.IO.File.Exists(filePath))
                        {
                            throw new FileNotFoundException();
                        }

                        return filePath;
                    }
                    else
                    {
                        throw new Exception("could not find case of eform!");
                    }
                    
                }
                catch (Exception exception)
                {
                    Log.LogException($"ItemListCaseService.DownloadEFormPdf: Got exception {exception.Message}");
                    throw new Exception("Something went wrong!", exception);
                }
            }

            throw new UnauthorizedAccessException();
        }
        
    }
}