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

// ReSharper disable UseAwaitUsing
namespace ItemsPlanning.Pn.Services.PlanningImportService
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;
    using ExcelService;
    using Infrastructure.Consts;
    using Infrastructure.Models.Import;
    using ItemsPlanningLocalizationService;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Microting.eForm.Infrastructure.Constants;
    using Microting.eFormApi.BasePn.Abstractions;
    using Microting.eFormApi.BasePn.Infrastructure.Models.API;
    using Microting.ItemsPlanningBase.Infrastructure.Data;
    using Microting.ItemsPlanningBase.Infrastructure.Data.Entities;
    using Microting.ItemsPlanningBase.Infrastructure.Enums;

    public class PlanningImportService : IPlanningImportService
    {
        private readonly ItemsPlanningPnDbContext _dbContext;
        private readonly IItemsPlanningLocalizationService _itemsPlanningLocalizationService;
        private readonly IEFormCoreService _coreService;
        private readonly IUserService _userService;
        private readonly IPlanningExcelService _planningExcelService;
        private readonly ILogger<PlanningImportService> _logger;

        public PlanningImportService(
            ItemsPlanningPnDbContext dbContext,
            IItemsPlanningLocalizationService itemsPlanningLocalizationService,
            IEFormCoreService coreService,
            IUserService userService,
            IPlanningExcelService planningExcelService,
            ILogger<PlanningImportService> logger)
        {
            _dbContext = dbContext;
            _itemsPlanningLocalizationService = itemsPlanningLocalizationService;
            _coreService = coreService;
            _userService = userService;
            _planningExcelService = planningExcelService;
            _logger = logger;
        }

        public async Task<OperationDataResult<ExcelParseResult>> ImportPlannings(Stream excelStream)
        {
            try
            {
                var result = new ExcelParseResult();
                var core = await _coreService.GetCore();

                var timeZone = await _userService.GetCurrentUserTimeZoneInfo();
                var templatesDto = await core.TemplateItemReadAll(
                    false,
                    "",
                    "",
                    false,
                    "",
                    new List<int>(),
                    timeZone);

                // Parse excel file
                var fileResult = _planningExcelService.ParsePlanningImportFile(excelStream);

                // Validation
                var excelErrors = new List<ExcelParseErrorModel>();

                foreach (var excelModel in fileResult)
                {
                    if (string.IsNullOrEmpty(excelModel.EFormName))
                    {
                        var error = new ExcelParseErrorModel
                        {
                            Col = PlanningImportExcelConsts.EformNameCol,
                            Row = excelModel.ExcelRow,
                            Message = _itemsPlanningLocalizationService.GetString(
                                "EformNameIsEmpty")
                        };

                        excelErrors.Add(error);
                    }

                    if (string.IsNullOrEmpty(excelModel.ItemName))
                    {
                        var error = new ExcelParseErrorModel
                        {
                            Col = PlanningImportExcelConsts.PlanningItemNameCol,
                            Row = excelModel.ExcelRow,
                            Message = _itemsPlanningLocalizationService.GetString(
                                "ItemNameIsEmpty")
                        };

                        excelErrors.Add(error);
                    }

                    if (!excelModel.Folders.Any())
                    {
                        var error = new ExcelParseErrorModel
                        {
                            Row = excelModel.ExcelRow,
                            Message = _itemsPlanningLocalizationService.GetString(
                                "FolderNotFound")
                        };

                        excelErrors.Add(error);
                    }

                    var templateByName = templatesDto
                        .FirstOrDefault(x => string.Equals(
                            x.Label,
                            excelModel.EFormName,
                            StringComparison.CurrentCultureIgnoreCase));

                    if (templateByName == null)
                    {
                        var error = new ExcelParseErrorModel
                        {
                            Col = PlanningImportExcelConsts.EformNameCol,
                            Row = excelModel.ExcelRow,
                            Message = _itemsPlanningLocalizationService.GetString(
                                "EformNotFound")
                        };

                        excelErrors.Add(error);
                    }
                    else
                    {
                        excelModel.EFormId = templateByName.Id;
                    }
                }

                result.Errors = excelErrors;

                if (excelErrors.Any())
                {
                    return new OperationDataResult<ExcelParseResult>(
                        true,
                        result);
                }


                // Process plannings
                //using (var transaction = await _dbContext.Database.BeginTransactionAsync())
                //{
                try
                {
                    var sdkDbContext = core.dbContextHelper.GetDbContext();

                    // Process planning tags
                    var tags = await _dbContext.PlanningTags
                        .AsNoTracking()
                        .Select(x => new
                        {
                            x.Id,
                            Name = x.Name.ToLower(),
                        }).ToListAsync();

                    var fileTags = fileResult.SelectMany(x => x.Tags)
                        .GroupBy(x => x)
                        .Select(x => x.Key)
                        .ToList();

                    foreach (var fileTag in fileTags)
                    {
                        var planningTagExist = tags.FirstOrDefault(x => x.Name == fileTag.ToLower());

                        if (planningTagExist == null)
                        {
                            var planningTag = new PlanningTag
                            {
                                Name = fileTag,
                                CreatedAt = DateTime.UtcNow,
                                CreatedByUserId = _userService.UserId,
                                UpdatedAt = DateTime.UtcNow,
                                UpdatedByUserId = _userService.UserId,
                                Version = 1,
                            };
                            await _dbContext.PlanningTags.AddAsync(planningTag);
                            await _dbContext.SaveChangesAsync();
                        }
                    }

                    tags = await _dbContext.PlanningTags
                        .AsNoTracking()
                        .Select(x => new
                        {
                            x.Id,
                            Name = x.Name.ToLower(),
                        }).ToListAsync();

                    // Folders
                    var folders = await sdkDbContext.folders
                        .AsNoTracking()
                        .Select(x => new PlanningImportFolderModel
                        {
                            Id = x.Id,
                            Label = x.Name.ToLower(),
                            Description = x.Description,
                        }).ToListAsync();

                    // Process folders
                    foreach (var excelModel in fileResult)
                    {
                        for (var i = 0; i < excelModel.Folders.Count; i++)
                        {
                            var folderModel = excelModel.Folders[i];
                            var sdkFolder = folders.FirstOrDefault(x => x.Label == folderModel.Label.ToLower());

                            if (sdkFolder == null)
                            {
                                // If it's not a first folder then attach previous folder
                                if (i > 0)
                                {
                                    var parentId = excelModel.Folders[i - 1].Id;
                                    folderModel.Id = await core.FolderCreate(
                                        folderModel.Label,
                                        folderModel.Description,
                                        parentId);
                                }
                                else
                                {
                                    folderModel.Id = await core.FolderCreate(
                                        folderModel.Label,
                                        folderModel.Description,
                                        null);
                                }

                                folders.Add(folderModel);
                            }
                            else
                            {
                                folderModel.Id = sdkFolder.Id;
                            }
                        }
                    }

                    // Process plannings
                    foreach (var excelModel in fileResult)
                    {
                        var tagIds = new List<int>();
                        if (excelModel.Tags.Any())
                        {
                            foreach (var tagName in excelModel.Tags)
                            {
                                var planningTagExist = tags.FirstOrDefault(x => x.Name == tagName.ToLower());

                                if (planningTagExist != null)
                                {
                                    tagIds.Add(planningTagExist.Id);
                                }
                            }
                        }

                        var sdkFolder = excelModel.Folders.Last();

                        var planning = new Planning
                        {
                            Name = excelModel.ItemName,
                            CreatedByUserId = _userService.UserId,
                            CreatedAt = DateTime.UtcNow,
                            RepeatUntil = excelModel.RepeatUntil,
                            DayOfWeek = excelModel.DayOfWeek,
                            DayOfMonth = excelModel.DayOfMonth,
                            Enabled = true,
                            RelatedEFormId = (int) excelModel.EFormId,
                            RelatedEFormName = excelModel.EFormName,
                            PlanningsTags = new List<PlanningsTags>()
                        };

                        if (excelModel.RepeatEvery != null)
                        {
                            planning.RepeatEvery = (int) excelModel.RepeatEvery;
                        }

                        if (excelModel.RepeatType != null)
                        {
                            planning.RepeatType = (RepeatType) excelModel.RepeatType;
                        }

                        if (sdkFolder != null)
                        {
                            planning.SdkFolderName = sdkFolder.Label;
                        }

                        planning.StartDate = DateTime.UtcNow;

                        foreach (var tagId in tagIds)
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
                        var item = new Item()
                        {
                            LocationCode = string.Empty,
                            ItemNumber = string.Empty,
                            Description = string.Empty,
                            Name = string.Empty,
                            Version = 1,
                            WorkflowState = Constants.WorkflowStates.Created,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow,
                            Enabled = true,
                            BuildYear = string.Empty,
                            Type = string.Empty,
                            PlanningId = planning.Id,
                            CreatedByUserId = _userService.UserId,
                            UpdatedByUserId = _userService.UserId,
                        };

                        if (sdkFolder != null)
                        {
                            item.eFormSdkFolderId = (int) sdkFolder.Id;
                        }

                        await item.Create(_dbContext);
                    }

                    //await transaction.CommitAsync();
                }
                catch
                {
                    //await transaction.RollbackAsync();
                    throw;
                }
                //}

                result.Message = _itemsPlanningLocalizationService.GetString("ImportCompletedSuccessfully");

                return new OperationDataResult<ExcelParseResult>(
                    true,
                    result);
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                _logger.LogError(e, e.Message);
                return new OperationDataResult<ExcelParseResult>(false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileImportingExcelFile"));
            }
        }
    }
}