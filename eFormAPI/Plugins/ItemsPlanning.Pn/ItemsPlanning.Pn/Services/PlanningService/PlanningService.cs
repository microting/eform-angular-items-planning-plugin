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

namespace ItemsPlanning.Pn.Services.PlanningService
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Linq;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Infrastructure.Helpers;
    using Infrastructure.Models;
    using ItemsPlanningLocalizationService;
    using Microsoft.AspNetCore.Http;
    using Microsoft.EntityFrameworkCore;
    using Microting.eForm.Infrastructure.Constants;
    using Microting.eFormApi.BasePn.Abstractions;
    using Microting.eFormApi.BasePn.Infrastructure.Extensions;
    using Microting.eFormApi.BasePn.Infrastructure.Models.API;
    using Microting.eFormApi.BasePn.Infrastructure.Models.Common;
    using Microting.ItemsPlanningBase.Infrastructure.Data;
    using Microting.ItemsPlanningBase.Infrastructure.Data.Entities;
    using Newtonsoft.Json.Linq;

    public class PlanningService : IPlanningService
    {
        private readonly ItemsPlanningPnDbContext _dbContext;
        private readonly IItemsPlanningLocalizationService _itemsPlanningLocalizationService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEFormCoreService _coreService;

        public PlanningService(
            ItemsPlanningPnDbContext dbContext,
            IItemsPlanningLocalizationService itemsPlanningLocalizationService,
            IHttpContextAccessor httpContextAccessor, IEFormCoreService coreService)
        {
            _dbContext = dbContext;
            _itemsPlanningLocalizationService = itemsPlanningLocalizationService;
            _httpContextAccessor = httpContextAccessor;
            _coreService = coreService;
        }

        public async Task<OperationDataResult<PlanningsPnModel>> Index(PlanningsRequestModel pnRequestModel)
        {
            try
            {
                PlanningsPnModel planningsModel = new PlanningsPnModel();

                IQueryable<Planning> planningsQuery = _dbContext.Plannings.AsQueryable();
                if (!string.IsNullOrEmpty(pnRequestModel.Sort))
                {
                    if (pnRequestModel.IsSortDsc)
                    {
                        planningsQuery = planningsQuery
                            .CustomOrderByDescending(pnRequestModel.Sort);
                    }
                    else
                    {
                        planningsQuery = planningsQuery
                            .CustomOrderBy(pnRequestModel.Sort);
                    }
                }
                else
                {
                    planningsQuery = _dbContext.Plannings
                        .OrderBy(x => x.Id);
                }

                if (!string.IsNullOrEmpty(pnRequestModel.NameFilter))
                {
                    planningsQuery = planningsQuery.Where(x =>
                        x.Item.Name.Contains(pnRequestModel.NameFilter, StringComparison.CurrentCultureIgnoreCase));
                }

                if (!string.IsNullOrEmpty(pnRequestModel.DescriptionFilter))
                {
                    planningsQuery = planningsQuery.Where(x =>
                        x.Item.Description.Contains(pnRequestModel.DescriptionFilter,
                            StringComparison.CurrentCultureIgnoreCase));
                }


                planningsQuery
                    = planningsQuery
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .Skip(pnRequestModel.Offset)
                        .Take(pnRequestModel.PageSize);

                List<PlanningPnModel> plannings = await planningsQuery.Select(x => new PlanningPnModel()
                {
                    Id = x.Id,
                    Name = x.Item.Name,
                    Description = x.Item.Description,
                    RepeatEvery = x.RepeatEvery,
                    RepeatType = x.RepeatType,
                    RepeatUntil = x.RepeatUntil,
                    DayOfWeek = x.DayOfWeek,
                    DayOfMonth = x.DayOfMonth,
                    RelatedEFormId = x.RelatedEFormId,
                    RelatedEFormName = x.RelatedEFormName,
                    SdkFolderName = x.SdkFolderName,
                    AssignedSites = x.PlanningSites
                        .Where(y => y.WorkflowState != Constants.WorkflowStates.Removed)
                        .Select(y => new PlanningAssignedSitesModel
                        {
                            Id = y.Id,
                            SiteId = y.SiteId,
                        }).ToList(),
                }).ToListAsync();

                // get site names
                var core = await _coreService.GetCore();
                using (var dbContext = core.dbContextHelper.GetDbContext())
                {
                    var sites = await dbContext.sites
                        .AsNoTracking()
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .Select(x => new CommonDictionaryModel
                        {
                            Id = x.Id,
                            Name = x.Name,
                        }).ToListAsync();

                    foreach (var planning in plannings)
                    {
                        foreach (var assignedSite in planning.AssignedSites)
                        {
                            foreach (var site in sites)
                            {
                                if (site.Id == assignedSite.SiteId)
                                {
                                    assignedSite.Name = site.Name;
                                }
                            }
                        }
                    }
                }

                planningsModel.Total = await _dbContext.Plannings.CountAsync(x =>
                    x.WorkflowState != Constants.WorkflowStates.Removed);
                planningsModel.Plannings = plannings;

                return new OperationDataResult<PlanningsPnModel>(true, planningsModel);
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                return new OperationDataResult<PlanningsPnModel>(false,
                    _itemsPlanningLocalizationService.GetString("ErrorObtainingLists"));
            }
        }

        public async Task<OperationResult> AssignPlanning(PlanningAssignSitesModel requestModel)
        {
            using (var transaction = await _dbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    var planning = await _dbContext.Plannings
                        .Include(x => x.PlanningSites)
                        .Where(x => x.Id == requestModel.PlanningId)
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .FirstOrDefaultAsync();

                    if (planning == null)
                    {
                        transaction.Rollback();
                        return new OperationDataResult<PlanningsPnModel>(false,
                            _itemsPlanningLocalizationService.GetString("PlanningNotFound"));
                    }

                    // for remove
                    var assignmentsRequestIds = requestModel.Assignments
                        .Select(x => x.SiteId)
                        .ToList();

                    var forRemove = planning.PlanningSites
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .Where(x => !assignmentsRequestIds.Contains(x.SiteId))
                        .ToList();

                    foreach (var planningSite in forRemove)
                    {
                        await planningSite.Delete(_dbContext);
                    }

                    // for create
                    var assignmentsIds = planning.PlanningSites
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .Select(x => x.SiteId)
                        .ToList();

                    var assignmentsForCreate = requestModel.Assignments
                        .Where(x => !assignmentsIds.Contains(x.SiteId))
                        .Select(x => x.SiteId)
                        .ToList();

                    foreach (var assignmentSiteId in assignmentsForCreate)
                    {
                        var planningSite = new PlanningSite
                        {
                            PlanningId = planning.Id,
                            SiteId = assignmentSiteId,
                        };

                        await planningSite.Create(_dbContext);
                    }

                    transaction.Commit();
                    return new OperationResult(true,
                        _itemsPlanningLocalizationService.GetString("SitesAssignedSuccessfully"));
                }
                catch (Exception e)
                {
                    Trace.TraceError(e.Message);
                    return new OperationDataResult<PlanningsPnModel>(false,
                        _itemsPlanningLocalizationService.GetString("ErrorObtainingLists"));
                }
            }
        }

        public async Task<OperationResult> Create(PlanningPnModel model)
        {
            await using var transaction = await _dbContext.Database.BeginTransactionAsync();
            await using var sdkDbContext =
                _coreService.GetCore().GetAwaiter().GetResult().dbContextHelper.GetDbContext();
            try
            {
                var template = await _coreService.GetCore().Result.TemplateItemRead(model.RelatedEFormId);
                var sdkFolderName = await sdkDbContext.folders.SingleAsync(x => x.Id == model.Item.eFormSdkFolderId);
                var itemsList = new Planning
                {
                    Name = model.Item.Name,
                    Description = model.Item.Description,
                    CreatedByUserId = UserId,
                    CreatedAt = DateTime.UtcNow,
                    RepeatEvery = model.RepeatEvery,
                    RepeatUntil = model.RepeatUntil,
                    RepeatType = model.RepeatType,
                    DayOfWeek = model.DayOfWeek,
                    DayOfMonth = model.DayOfMonth,
                    Enabled = true,
                    RelatedEFormId = model.RelatedEFormId,
                    RelatedEFormName = template?.Label,
                    SdkFolderName = sdkFolderName.Name
                };

                await itemsList.Create(_dbContext);
                var item = new Item()
                {
                    LocationCode = model.Item.LocationCode,
                    ItemNumber = model.Item.ItemNumber,
                    Description = model.Item.Description,
                    Name = model.Item.Name,
                    Version = 1,
                    WorkflowState = Constants.WorkflowStates.Created,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Enabled = true,
                    BuildYear = model.Item.BuildYear,
                    Type = model.Item.Type,
                    PlanningId = itemsList.Id,
                    CreatedByUserId = UserId,
                    eFormSdkFolderId = model.EformSdkFolderId
                };
                await item.Create(_dbContext);


                await transaction.CommitAsync();
                return new OperationResult(
                    true,
                    _itemsPlanningLocalizationService.GetString("ListCreatedSuccessfully"));
            }
            catch (Exception e)
            {
                await transaction.RollbackAsync();
                Trace.TraceError(e.Message);
                return new OperationResult(false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileCreatingList"));
            }
        }
        public async Task<OperationDataResult<PlanningPnModel>> Read(int listId)
        {
            try
            {
                var planning = await _dbContext.Plannings
                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed && x.Id == listId)
                    .Select(x => new PlanningPnModel()
                    {
                        Id = x.Id,
                        RepeatUntil = x.RepeatUntil,
                        RepeatEvery = x.RepeatEvery,
                        RepeatType = x.RepeatType,
                        DayOfWeek = x.DayOfWeek,
                        DayOfMonth = x.DayOfMonth,
                        Description = x.Description,
                        Name = x.Name,
                        RelatedEFormId = x.RelatedEFormId,
                        RelatedEFormName = x.RelatedEFormName,
                        LabelEnabled = x.LabelEnabled,
                        DeployedAtEnabled = x.DeployedAtEnabled,
                        DescriptionEnabled = x.DescriptionEnabled,
                        DoneAtEnabled = x.DoneAtEnabled,
                        DoneByUserNameEnabled = x.DoneByUserNameEnabled,
                        UploadedDataEnabled = x.UploadedDataEnabled,
                        ItemNumberEnabled = x.ItemNumberEnabled,
                        LocationCodeEnabled = x.LocationCodeEnabled,
                        BuildYearEnabled = x.BuildYearEnabled,
                        TypeEnabled = x.TypeEnabled,
                        NumberOfImagesEnabled = x.NumberOfImagesEnabled,
                        LastExecutedTime = x.LastExecutedTime,
                        Item = new PlanningItemModel
                        {
                            Id = x.Item.Id,
                            BuildYear = x.Item.BuildYear,
                            Description = x.Item.Description,
                            ItemNumber = x.Item.ItemNumber,
                            LocationCode = x.Item.LocationCode,
                            Name = x.Item.Name,
                            Type = x.Item.Type,
                            eFormSdkFolderId = x.Item.eFormSdkFolderId
                        },
                        AssignedSites = x.PlanningSites
                            .Where(y => y.WorkflowState != Constants.WorkflowStates.Removed)
                            .Select(y => new PlanningAssignedSitesModel
                            {
                                Id = y.Id,
                                SiteId = y.SiteId,
                            }).ToList(),
                    }).FirstOrDefaultAsync();

                if (planning == null)
                {
                    return new OperationDataResult<PlanningPnModel>(
                        false,
                        _itemsPlanningLocalizationService.GetString("ListNotFound"));
                }

                // get site names
                var core = await _coreService.GetCore();
                await using (var dbContext = core.dbContextHelper.GetDbContext())
                {
                    planning.Item.eFormSdkFolderName = await dbContext.folders
                        .AsNoTracking()
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .Where(x => x.Id == planning.Item.eFormSdkFolderId)
                        .Select(x => x.Name)
                        .FirstOrDefaultAsync();

                    var sites = await dbContext.sites
                        .AsNoTracking()
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .Select(x => new CommonDictionaryModel
                        {
                            Id = x.Id,
                            Name = x.Name,
                        }).ToListAsync();

                    foreach (var assignedSite in planning.AssignedSites)
                    {
                        foreach (var site in sites)
                        {
                            if (site.Id == assignedSite.SiteId)
                            {
                                assignedSite.Name = site.Name;
                            }
                        }
                    }
                }

                return new OperationDataResult<PlanningPnModel>(
                    true,
                    planning);
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                return new OperationDataResult<PlanningPnModel>(
                    false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileObtainingList"));
            }
        }
        public async Task<OperationResult> Update(PlanningPnModel updateModel)
        {
            // await using var transaction = await _dbContext.Database.BeginTransactionAsync();
            var _sdkCore =
                await _coreService.GetCore();
            var sdkDbContext = _sdkCore.dbContextHelper.GetDbContext();
            try
            {
                var template = await _sdkCore.TemplateItemRead(updateModel.RelatedEFormId);
                var sdkFolder = await sdkDbContext.folders.SingleAsync(x => x.Id == updateModel.Item.eFormSdkFolderId);
                var folderName = sdkFolder.Name;
                var planning = await _dbContext.Plannings.SingleAsync(x => x.Id == updateModel.Id);

                planning.RepeatUntil = updateModel.RepeatUntil;
                planning.RepeatEvery = updateModel.RepeatEvery;
                planning.RepeatType = updateModel.RepeatType;
                planning.DayOfWeek = updateModel.DayOfWeek;
                planning.DayOfMonth = updateModel.DayOfMonth;
                planning.Description = updateModel.Item.Description;
                planning.Name = updateModel.Item.Name;
                planning.UpdatedAt = DateTime.UtcNow;
                planning.UpdatedByUserId = UserId;
                planning.RelatedEFormId = updateModel.RelatedEFormId;
                planning.RelatedEFormName = template?.Label;
                planning.LabelEnabled = updateModel.LabelEnabled;
                planning.DescriptionEnabled = updateModel.DescriptionEnabled;
                planning.DeployedAtEnabled = updateModel.DeployedAtEnabled;
                planning.DoneAtEnabled = updateModel.DoneAtEnabled;
                planning.DoneByUserNameEnabled = updateModel.DoneByUserNameEnabled;
                planning.UploadedDataEnabled = updateModel.UploadedDataEnabled;
                planning.ItemNumberEnabled = updateModel.ItemNumberEnabled;
                planning.LocationCodeEnabled = updateModel.LocationCodeEnabled;
                planning.BuildYearEnabled = updateModel.BuildYearEnabled;
                planning.TypeEnabled = updateModel.TypeEnabled;
                planning.NumberOfImagesEnabled = updateModel.NumberOfImagesEnabled;
                planning.LastExecutedTime = updateModel.LastExecutedTime;
                planning.SdkFolderName = folderName;

                await planning.Update(_dbContext);

                var item = _dbContext.Items.FirstOrDefault(x => x.Id == updateModel.Item.Id);
                if (item == null)
                {
                    var newItem = new Item()
                    {
                        LocationCode = updateModel.Item.LocationCode,
                        ItemNumber = updateModel.Item.ItemNumber,
                        Description = updateModel.Item.Description,
                        Name = updateModel.Item.Name,
                        Version = 1,
                        WorkflowState = Constants.WorkflowStates.Created,
                        CreatedAt = DateTime.UtcNow,
                        CreatedByUserId = UserId,
                        UpdatedAt = DateTime.UtcNow,
                        Enabled = true,
                        BuildYear = updateModel.Item.BuildYear,
                        Type = updateModel.Item.Type,
                        PlanningId = planning.Id,
                        eFormSdkFolderId = updateModel.Item.eFormSdkFolderId
                    };
                    await newItem.Create(_dbContext);
                }
                else
                {
                    item.LocationCode = updateModel.Item.LocationCode;
                    item.ItemNumber = updateModel.Item.ItemNumber;
                    item.Description = updateModel.Item.Description;
                    item.Name = updateModel.Item.Name;
                    item.UpdatedByUserId = UserId;
                    item.UpdatedAt = DateTime.UtcNow;
                    item.Enabled = true;
                    item.BuildYear = updateModel.Item.BuildYear;
                    item.Type = updateModel.Item.Type;
                    item.PlanningId = planning.Id;
                    item.eFormSdkFolderId = updateModel.Item.eFormSdkFolderId;

                    await item.Update(_dbContext);
                }

                // transaction.Commit();
                return new OperationResult(
                    true,
                    _itemsPlanningLocalizationService.GetString("ListUpdatedSuccessfully"));
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                // transaction.Rollback();
                return new OperationResult(
                    false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileUpdatingList"));
            }
        }

        public async Task<OperationResult> Delete(int id)
        {
            try
            {
                var planning = await _dbContext.Plannings.SingleAsync(x => x.Id == id);

                await planning.Delete(_dbContext);

                return new OperationResult(
                    true,
                    _itemsPlanningLocalizationService.GetString("ListDeletedSuccessfully"));
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                return new OperationResult(
                    false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileRemovingList"));
            }
        }

        
        
        private Item FindItem(bool numberExists, int numberColumn, bool itemNameExists,
            int itemNameColumn, JToken itemObj)
        {
            Item item = null;

            if (numberExists)
            {
                string itemNo = itemObj[numberColumn].ToString();
                item = _dbContext.Items.SingleOrDefault(x => x.ItemNumber == itemNo);
            }

            if (itemNameExists)
            {
                string itemName = itemObj[itemNameColumn].ToString();
                item = _dbContext.Items.SingleOrDefault(x => x.Name == itemName);
            }

            return item;
        }
        
        public async Task<OperationResult> ImportUnit(UnitImportModel unitAsJson)
        {
            try
            {
                {
                    JToken rawJson = JToken.Parse(unitAsJson.ImportList);
                    JToken rawHeadersJson = JToken.Parse(unitAsJson.Headers);

                    JToken headers = rawHeadersJson;
                    IEnumerable<JToken> itemObjects = rawJson.Skip(1);
                    
                    foreach (JToken itemObj in itemObjects)
                    {
                        bool numberExists = int.TryParse(headers[0]["headerValue"].ToString(), out int numberColumn);
                        bool itemNameExists = int.TryParse(headers[1]["headerValue"].ToString(),
                            out int nameColumn);
                        if (numberExists || itemNameExists)
                        {
                            Item existingItem = FindItem(numberExists, numberColumn, itemNameExists,
                                nameColumn, itemObj);
                            if (existingItem == null)
                            {
                                PlanningItemModel itemModel =
                                    ItemsHelper.ComposeValues(new PlanningItemModel(), headers, itemObj);

                                Item newItem = new Item
                                {
                                    ItemNumber = itemModel.ItemNumber,
                                    Name = itemModel.Name,
                                    Description = itemModel.Description,
                                    LocationCode = itemModel.LocationCode,
                                 

                                };
                               await newItem.Create(_dbContext);
  
                            }
                            else
                            {
                                if (existingItem.WorkflowState == Constants.WorkflowStates.Removed)
                                {                                    
                                    Item item = await _dbContext.Items.SingleOrDefaultAsync(x => x.Id == existingItem.Id);
                                    if (item != null)
                                    {
                                        item.Name = existingItem.Name;
                                        item.Description = existingItem.Description;
                                        item.ItemNumber = existingItem.ItemNumber;
                                        item.LocationCode = existingItem.LocationCode;
                                        item.WorkflowState = Constants.WorkflowStates.Created;

                                        await item.Update(_dbContext);
                                    }
                                }
                            }
                        }
                        
                    }
                }
                return new OperationResult(true,
                    _itemsPlanningLocalizationService.GetString("ItemImportes"));
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                _coreService.LogException(e.Message);
                return new OperationResult(false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileImportingItems"));
            }
        }

        public int UserId
        {
            get
            {
                var value = _httpContextAccessor?.HttpContext.User?.FindFirstValue(ClaimTypes.NameIdentifier);
                return value == null ? 0 : int.Parse(value);
            }
        }
    }
}