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

using Microting.eForm.Infrastructure.Data.Entities;

namespace ItemsPlanning.Pn.Services.PlanningService
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Linq;
    using System.Threading.Tasks;
    using Infrastructure.Helpers;
    using Infrastructure.Models;
    using ItemsPlanningLocalizationService;
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
        private readonly IUserService _userService;
        private readonly IEFormCoreService _coreService;

        public PlanningService(
            ItemsPlanningPnDbContext dbContext,
            IItemsPlanningLocalizationService itemsPlanningLocalizationService,
            IUserService userService,
            IEFormCoreService coreService)
        {
            _dbContext = dbContext;
            _itemsPlanningLocalizationService = itemsPlanningLocalizationService;
            _coreService = coreService;
            _userService = userService;
        }

        public async Task<OperationDataResult<PlanningsPnModel>> Index(PlanningsRequestModel pnRequestModel)
        {
            try
            {
                var planningsModel = new PlanningsPnModel();
                var sdkCore =
                    await _coreService.GetCore();
                var sdkDbContext = sdkCore.dbContextHelper.GetDbContext();

                var planningsQuery = _dbContext.Plannings.AsQueryable();
                if (!string.IsNullOrEmpty(pnRequestModel.Sort) && pnRequestModel.Sort != "TranslatedName")
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

                if (pnRequestModel.TagIds.Any())
                {
                    foreach(var tagId in pnRequestModel.TagIds)
                    {
                        planningsQuery = planningsQuery.Where(x => x.Item.Planning.PlanningsTags.Any(y =>
                            y.PlanningTagId == tagId && y.WorkflowState != Constants.WorkflowStates.Removed));
                    }
                }


                planningsQuery
                    = planningsQuery
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .Skip(pnRequestModel.Offset)
                        .Take(pnRequestModel.PageSize);

                var localeString = await _userService.GetCurrentUserLocale();
                if (string.IsNullOrEmpty(localeString))
                {
                    return new OperationDataResult<PlanningsPnModel>(false,
                        _itemsPlanningLocalizationService.GetString("LocaleDoesNotExist"));
                }
                var language = sdkDbContext.Languages.Single(x => string.Equals(x.LanguageCode, localeString, StringComparison.CurrentCultureIgnoreCase));
                var languageIemPlanning = _dbContext.Languages.Single(x => x.Id == language.Id);
                List<int> checkListIds = await planningsQuery.Select(x => x.RelatedEFormId).ToListAsync();
                List<KeyValuePair<int, string>> checkListWorkflowState = new List<KeyValuePair<int, string>>();
                foreach (CheckList checkList in sdkDbContext.CheckLists.Where(x => checkListIds.Contains(x.Id)).ToList())
                {
                    KeyValuePair<int, string>
                        kvp = new KeyValuePair<int, string>(checkList.Id, checkList.WorkflowState);
                    checkListWorkflowState.Add(kvp);
                }
                var plannings = await planningsQuery.Select(x => new PlanningPnModel()

                {
                    Id = x.Id,
                    TranslationsName = x.NameTranslations.Where(y => y.WorkflowState != Constants.WorkflowStates.Removed)
                        .Select(y => new PlanningNameTranslations()
                        {
                            Id = y.Id,
                            Language = y.Language.LanguageCode,
                            Name = y.Name,
                            LocaleName = y.Language.Name
                        }).ToList(),
                    TranslatedName = x.NameTranslations
                        .Where(y=> y.WorkflowState != Constants.WorkflowStates.Removed)
                        .Where(y => y.Language.Id == languageIemPlanning.Id)
                        .Select(y => y.Name)
                        .FirstOrDefault(),
                    Description = x.Description,
                    RepeatEvery = x.RepeatEvery,
                    RepeatType = x.RepeatType,
                    RepeatUntil = x.RepeatUntil,
                    DayOfWeek = x.DayOfWeek,
                    DayOfMonth = x.DayOfMonth,
                    RelatedEFormId = x.RelatedEFormId,
                    RelatedEFormName = x.RelatedEFormName,
                    SdkFolderName = x.SdkFolderName,
                    StartDate = x.StartDate,
                    AssignedSites = x.PlanningSites
                        .Where(y => y.WorkflowState != Constants.WorkflowStates.Removed)
                        .Select(y => new PlanningAssignedSitesModel
                        {
                            Id = y.Id,
                            SiteId = y.SiteId,
                        }).ToList(),
                    Tags = x.PlanningsTags
                        .Where(y => y.WorkflowState != Constants.WorkflowStates.Removed)
                        .Select(y => new CommonDictionaryModel
                        {
                            Id = y.PlanningTagId,
                            Name = y.PlanningTag.Name
                        }).ToList(),
                    Item = new PlanningItemModel
                    {
                        Id = x.Item.Id,
                        BuildYear = x.Item.BuildYear,
                        Description = x.Item.Description,
                        ItemNumber = x.Item.ItemNumber,
                        LocationCode = x.Item.LocationCode,
                        Name = x.Item.Name,
                        Type = x.Item.Type,
                        eFormSdkFolderId = x.Item.eFormSdkFolderId,
                        eFormSdkFolderName = x.SdkFolderName
                    },
                }).ToListAsync();

                // get site names

                var sites = await sdkDbContext.Sites
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
                        foreach (var site in sites.Where(site => site.Id == assignedSite.SiteId))
                        {
                            assignedSite.Name = site.Name;
                        }
                    }

                    planning.isEformRemoved =
                        checkListWorkflowState.Single(x => x.Key == planning.RelatedEFormId).Value ==
                        Constants.WorkflowStates.Removed;
                }

                planningsModel.Total = await _dbContext.Plannings.CountAsync(x =>
                    x.WorkflowState != Constants.WorkflowStates.Removed);
                planningsModel.Plannings = plannings;

                if (pnRequestModel.Sort == "TranslatedName")
                {
                    if (pnRequestModel.IsSortDsc)
                    {
                        planningsModel.Plannings = planningsModel.Plannings.OrderByDescending(x => x.TranslatedName).ToList();
                    }
                    else
                    {
                        planningsModel.Plannings = planningsModel.Plannings.OrderBy(x => x.TranslatedName).ToList();
                    }
                }

                return new OperationDataResult<PlanningsPnModel>(true, planningsModel);
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                return new OperationDataResult<PlanningsPnModel>(false,
                    _itemsPlanningLocalizationService.GetString("ErrorObtainingLists"));
            }
        }

        private string CheckWorkflowState(List<KeyValuePair<int, string>> keyValuePairs, int id)
        {
            return keyValuePairs.Single(y => y.Key == id).Value;
        }

        public async Task<OperationResult> Create(PlanningPnModel model)
        {
            //await using var transaction = await _dbContext.Database.BeginTransactionAsync();
            var sdkCore =
                await _coreService.GetCore();
            var sdkDbContext = sdkCore.dbContextHelper.GetDbContext();
            try
            {
                var tagIds = new List<int>();
                if (!string.IsNullOrEmpty(model.NewTags))
                {
                    var tagNames = model.NewTags.Replace(" ", "").Split(',');
                    foreach(var tagName in tagNames)
                    {
                        var planningTag = new PlanningTag
                        {
                            Name = tagName,
                            CreatedAt = DateTime.UtcNow,
                            CreatedByUserId = _userService.UserId,
                            UpdatedAt = DateTime.UtcNow,
                            UpdatedByUserId = _userService.UserId,
                            Version = 1,
                        };
                        await _dbContext.PlanningTags.AddAsync(planningTag);
                        await _dbContext.SaveChangesAsync();
                        tagIds.Add(planningTag.Id);
                    }
                }

                tagIds.AddRange(model.TagsIds);


                var localeString = await _userService.GetCurrentUserLocale();
                if (string.IsNullOrEmpty(localeString))
                {
                    return new OperationResult(
                        true,
                        _itemsPlanningLocalizationService.GetString("LocaleDoesNotExist"));
                }
                var language = sdkCore.dbContextHelper.GetDbContext().Languages.Single(x => string.Equals(x.LanguageCode, localeString, StringComparison.CurrentCultureIgnoreCase));

                var template = await _coreService.GetCore().Result.TemplateItemRead(model.RelatedEFormId, language);

                var sdkFolder = await sdkDbContext.Folders
                    .Include(x => x.Parent)
                    .SingleAsync(x => x.Id == model.Item.eFormSdkFolderId);

                // var sdkFolderName = await sdkDbContext.folders.SingleAsync(x => x.Id == model.Item.eFormSdkFolderId);


                var planning = new Planning
                {
                    Description = model.Item.Description,
                    CreatedByUserId = _userService.UserId,
                    CreatedAt = DateTime.UtcNow,
                    RepeatEvery = model.RepeatEvery,
                    RepeatUntil = model.RepeatUntil,
                    RepeatType = model.RepeatType,
                    DayOfWeek = model.DayOfWeek,
                    DayOfMonth = model.DayOfMonth,
                    Enabled = true,
                    RelatedEFormId = model.RelatedEFormId,
                    RelatedEFormName = template?.Label,
                    SdkFolderName = sdkFolder.Name,
                    PlanningsTags = new List<PlanningsTags>()
                };

                if (model.StartDate.HasValue)
                {
                    planning.StartDate = model.StartDate.Value;
                }
                else
                {
                    planning.StartDate = DateTime.UtcNow;
                }

                foreach(var tagId in tagIds)
                {
                    planning.PlanningsTags.Add(
                        new PlanningsTags
                        {
                            CreatedAt = DateTime.UtcNow,
                            CreatedByUserId = _userService.UserId,
                            UpdatedAt = DateTime.UtcNow,
                            UpdatedByUserId = _userService.UserId,
                            Version = 1,
                            PlanningTagId = tagId
                        });
                }

                await planning.Create(_dbContext);
                var languages = await _dbContext.Languages.ToListAsync();
                foreach (var translation in model.TranslationsName)
                {
                    var languageId = languages.Where(x => x.Name == translation.Language || x.LanguageCode == translation.LocaleName)
                        .Select(x => x.Id)
                        .FirstOrDefault();
                    if (languageId < 1)
                    {
                        return new OperationResult(
                            true,
                            _itemsPlanningLocalizationService.GetString("LocaleDoesNotExist"));
                    }

                    var planningNameTranslations = new PlanningNameTranslation()
                    {
                        LanguageId = languageId,
                        PlanningId = planning.Id,
                        Name = translation.Name,
                        CreatedByUserId = _userService.UserId,
                        UpdatedByUserId = _userService.UserId
                    };
                    await planningNameTranslations.Create(_dbContext);
                }
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
                    PlanningId = planning.Id,
                    CreatedByUserId = _userService.UserId,
                    eFormSdkFolderId = model.Item.eFormSdkFolderId
                };
                await item.Create(_dbContext);


                //await transaction.CommitAsync();
                return new OperationResult(
                    true,
                    _itemsPlanningLocalizationService.GetString("ListCreatedSuccessfully"));
            }
            catch (Exception e)
            {
                //await transaction.RollbackAsync();
                Trace.TraceError(e.Message);
                return new OperationResult(false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileCreatingList"));
            }
        }

        public async Task<OperationDataResult<PlanningPnModel>> Read(int listId)
        {
            try
            {
                var sdkCore =
                    await _coreService.GetCore();
                var sdkDbContext = sdkCore.dbContextHelper.GetDbContext();
                var localeString = await _userService.GetCurrentUserLocale();
                if (string.IsNullOrEmpty(localeString))
                {
                    return new OperationDataResult<PlanningPnModel>(
                        false,
                        _itemsPlanningLocalizationService.GetString("LocaleDoesNotExist"));
                }
                var language = sdkDbContext.Languages.Single(x => string.Equals(x.LanguageCode, localeString, StringComparison.CurrentCultureIgnoreCase));
                var planning = await _dbContext.Plannings
                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed && x.Id == listId)
                    .Select(x => new PlanningPnModel()
                    {
                        TranslationsName = x.NameTranslations.Where(y => y.WorkflowState != Constants.WorkflowStates.Removed)
                            .Select(y => new PlanningNameTranslations()
                            {
                                Id = y.Id,
                                Language = y.Language.Name,
                                Name = y.Name,
                                LocaleName = y.Language.LanguageCode
                            }).ToList(),
                        TranslatedName = x.NameTranslations
                            .Where(y => y.WorkflowState != Constants.WorkflowStates.Removed)
                            .Where(y => y.LanguageId == language.Id)
                            .Select(y => y.Name)
                            .FirstOrDefault(),
                        Id = x.Id,
                        RepeatUntil = x.RepeatUntil,
                        RepeatEvery = x.RepeatEvery,
                        RepeatType = x.RepeatType,
                        DayOfWeek = x.DayOfWeek,
                        DayOfMonth = x.DayOfMonth,
                        Description = x.Description,

                        RelatedEFormId = x.RelatedEFormId,
                        isEformRemoved = sdkCore.TemplateItemRead(x.RelatedEFormId, language).Result.WorkflowState == Constants.WorkflowStates.Removed,
                        RelatedEFormName = x.RelatedEFormName,
                        LabelEnabled = x.LabelEnabled,
                        DeployedAtEnabled = x.DeployedAtEnabled,
                        DescriptionEnabled = x.DescriptionEnabled,
                        DoneAtEnabled = x.DoneAtEnabled,
                        StartDate = x.StartDate,
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
                            eFormSdkFolderId = x.Item.eFormSdkFolderId,
                            eFormSdkFolderName = x.SdkFolderName
                        },
                        AssignedSites = x.PlanningSites
                            .Where(y => y.WorkflowState != Constants.WorkflowStates.Removed)
                            .Select(y => new PlanningAssignedSitesModel
                            {
                                Id = y.Id,
                                SiteId = y.SiteId,
                            }).ToList(),
                        TagsIds = x.PlanningsTags
                            .Where(y => y.WorkflowState != Constants.WorkflowStates.Removed)
                            .Select(y => y.PlanningTagId).ToList(),
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
                    planning.Item.eFormSdkFolderName = await dbContext.Folders
                        .AsNoTracking()
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .Where(x => x.Id == planning.Item.eFormSdkFolderId)
                        .Select(x => x.Name)
                        .FirstOrDefaultAsync();

                    var sites = await dbContext.Sites
                        .AsNoTracking()
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .Select(x => new CommonDictionaryModel
                        {
                            Id = x.Id,
                            Name = x.Name,
                        }).ToListAsync();

                    foreach (var assignedSite in planning.AssignedSites)
                    {
                        foreach (var site in sites.Where(site => site.Id == assignedSite.SiteId))
                        {
                            assignedSite.Name = site.Name;
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
            var sdkCore =
                await _coreService.GetCore();
            var sdkDbContext = sdkCore.dbContextHelper.GetDbContext();
            try
            {

                var localeString = await _userService.GetCurrentUserLocale();
                if (string.IsNullOrEmpty(localeString))
                {
                    return new OperationResult(
                        false,
                        _itemsPlanningLocalizationService.GetString("LocaleDoesNotExist"));
                }
                var language = sdkCore.dbContextHelper.GetDbContext().Languages.Single(x => string.Equals(x.LanguageCode, localeString, StringComparison.CurrentCultureIgnoreCase));
                var template = await sdkCore.TemplateItemRead(updateModel.RelatedEFormId, language);


                var sdkFolder = await sdkDbContext.Folders
                    .Include(x => x.Parent)
                    .SingleAsync(x => x.Id == updateModel.Item.eFormSdkFolderId);
                var planning = await _dbContext.Plannings
                                            .Include(x => x.PlanningsTags)
                                            .SingleAsync(x => x.Id == updateModel.Id);
                var folderName = sdkFolder.Name;

                var translationsPlanning = _dbContext.PlanningNameTranslation
                    .Where(x => x.Planning.Id == planning.Id)
                    .ToList();
                foreach (var translation in updateModel.TranslationsName)
                {
                    var updateTranslation = translationsPlanning
                        .FirstOrDefault(x => x.Id == translation.Id);
                    if (updateTranslation != null)
                    {
                        updateTranslation.Name = translation.Name;
                        await updateTranslation.Update(_dbContext);
                    }
                }

                planning.RepeatUntil = updateModel.RepeatUntil;
                planning.RepeatEvery = updateModel.RepeatEvery;
                planning.RepeatType = updateModel.RepeatType;
                planning.DayOfWeek = updateModel.DayOfWeek;
                planning.DayOfMonth = updateModel.DayOfMonth;
                planning.Description = updateModel.Description;
                planning.UpdatedAt = DateTime.UtcNow;
                planning.UpdatedByUserId = _userService.UserId;
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
                planning.SdkFolderName = sdkFolder.Name;

                if (updateModel.StartDate.HasValue)
                {
                    planning.StartDate = updateModel.StartDate.Value;
                }
                else
                {
                    planning.StartDate = DateTime.UtcNow;
                }

                var tagIds = planning.PlanningsTags
                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                    .Select(x => x.PlanningTagId)
                    .ToList();

                var tagsForDelete = planning.PlanningsTags
                        .Where(x => !updateModel.TagsIds.Contains(x.PlanningTagId))
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .ToList();

                var tagsForCreate = updateModel.TagsIds
                    .Where(x => !tagIds.Contains(x))
                    .ToList();

                foreach (var tag in tagsForDelete)
                {
                    _dbContext.PlanningsTags.Remove(tag);
                }

                foreach(var tagId in tagsForCreate)
                {
                    var planningsTags = new PlanningsTags
                    {
                        CreatedByUserId = _userService.UserId,
                        UpdatedByUserId = _userService.UserId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        PlanningId = planning.Id,
                        PlanningTagId = tagId,
                        Version = 1,
                    };

                    await _dbContext.PlanningsTags.AddAsync(planningsTags);
                }

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
                        CreatedByUserId = _userService.UserId,
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
                    item.UpdatedByUserId = _userService.UserId;
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
                var core = await _coreService.GetCore();
                var sdkDbContext = core.dbContextHelper.GetDbContext();
                var planning = await _dbContext.Plannings
                    .Include(x => x.Item)
                    .SingleAsync(x => x.Id == id);

                if (planning == null)
                {
                    return new OperationResult(false,
                        _itemsPlanningLocalizationService.GetString("PlanningNotFound"));
                }

                var planningCases = await _dbContext.PlanningCases
                    .Where(x => x.ItemId == planning.Item.Id)
                    .ToListAsync();

                foreach (var planningCase in planningCases)
                {
                    var planningCaseSites = await _dbContext.PlanningCaseSites
                        .Where(x => x.PlanningCaseId == planningCase.Id).ToListAsync();
                    foreach (var planningCaseSite in planningCaseSites.Where(planningCaseSite => planningCaseSite.MicrotingSdkCaseId != 0))
                    {
                        var result = await sdkDbContext.Cases.SingleAsync(x => x.Id == planningCaseSite.MicrotingSdkCaseId);
                        if (result.MicrotingUid != null)
                        {
                            await core.CaseDelete((int)result.MicrotingUid);
                        }
                    }
                    // Delete planning case
                    await planningCase.Delete(_dbContext);
                }

                var planningSites = await _dbContext.PlanningSites.Where(x => x.PlanningId == planning.Id).ToListAsync();
                foreach (var planningSite in planningSites)
                {
                    await planningSite.Delete(_dbContext);
                }

                var nameTranslationsPlaning =
                    await _dbContext.PlanningNameTranslation.Where(x => x.Planning.Id == planning.Id).ToListAsync();

                foreach (var translation in nameTranslationsPlaning)
                {
                    await translation.Delete(_dbContext);
                }

                // Delete planning
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
                var itemNo = itemObj[numberColumn].ToString();
                item = _dbContext.Items.SingleOrDefault(x => x.ItemNumber == itemNo);
            }

            if (itemNameExists)
            {
                var itemName = itemObj[itemNameColumn].ToString();
                item = _dbContext.Items.SingleOrDefault(x => x.Name == itemName);
            }

            return item;
        }

        public async Task<OperationResult> ImportUnit(UnitImportModel unitAsJson)
        {
            try
            {
                {
                    var rawJson = JToken.Parse(unitAsJson.ImportList);
                    var rawHeadersJson = JToken.Parse(unitAsJson.Headers);

                    var headers = rawHeadersJson;
                    var itemObjects = rawJson.Skip(1);

                    foreach (var itemObj in itemObjects)
                    {
                        var numberExists = int.TryParse(headers[0]["headerValue"].ToString(), out var numberColumn);
                        var itemNameExists = int.TryParse(headers[1]["headerValue"].ToString(),
                            out var nameColumn);
                        if (numberExists || itemNameExists)
                        {
                            var existingItem = FindItem(numberExists, numberColumn, itemNameExists,
                                nameColumn, itemObj);
                            if (existingItem == null)
                            {
                                var itemModel =
                                    ItemsHelper.ComposeValues(new PlanningItemModel(), headers, itemObj);

                                var newItem = new Item
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
                                    var item = await _dbContext.Items.SingleOrDefaultAsync(x => x.Id == existingItem.Id);
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
    }
}