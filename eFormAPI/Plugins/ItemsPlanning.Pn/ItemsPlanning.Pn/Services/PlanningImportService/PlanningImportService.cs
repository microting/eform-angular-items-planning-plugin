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

using Sentry;

namespace ItemsPlanning.Pn.Services.PlanningImportService;

using System;
using System.Collections.Generic;
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

public class PlanningImportService(
    ItemsPlanningPnDbContext context,
    IItemsPlanningLocalizationService itemsPlanningLocalizationService,
    IEFormCoreService coreService,
    IUserService userService,
    IPlanningExcelService planningExcelService,
    ILogger<PlanningImportService> logger)
    : IPlanningImportService
{
    public async Task<OperationDataResult<ExcelParseResult>> ImportPlannings(Stream excelStream)
    {
        try
        {
            var result = new ExcelParseResult();
            var core = await coreService.GetCore();
            await using var microtingDbContext = core.DbContextHelper.GetDbContext();

            var timeZone = await userService.GetCurrentUserTimeZoneInfo();
            await using var dbContext = core.DbContextHelper.GetDbContext();
            var theLanguage = await dbContext.Languages
                .SingleAsync(x => x.LanguageCode == "da");
            var templatesDto = await core.TemplateItemReadAll(
                false,
                "",
                "",
                false,
                "",
                new List<int>(),
                timeZone, theLanguage);

            // Parse excel file
            var fileResult = planningExcelService.ParsePlanningImportFile(excelStream);

            // Validation
            var excelErrors = new List<ExcelParseErrorModel>();

            List<string> languageCodes = new List<string>()
            {
                "da",
                "en-US",
                "de-DE"
            };

            foreach (var excelModel in fileResult)
            {
                if (!excelModel.Folders.Any())
                {
                    var error = new ExcelParseErrorModel
                    {
                        Row = excelModel.ExcelRow,
                        Message = itemsPlanningLocalizationService.GetString(
                            "FolderNotFound")
                    };

                    excelErrors.Add(error);
                }

                var templateByName = templatesDto
                    .FirstOrDefault(x =>
                        x.Label ==
                        excelModel.EFormName);

                if (templateByName == null)
                {
                    var error = new ExcelParseErrorModel
                    {
                        Col = PlanningImportExcelConsts.EformNameCol,
                        Row = excelModel.ExcelRow,
                        Message = itemsPlanningLocalizationService.GetString(
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
            try
            {

                // Process planning tags
                var tags = await context.PlanningTags
                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                    .Select(x => new
                    {
                        x.Id,
                        Name = x.Name
                    }).ToListAsync();

                // Trim tag names
                foreach (var excelModel in fileResult)
                {
                    for (var y = 0; y < excelModel.Tags.Count; y++)
                    {
                        excelModel.Tags[y] = excelModel.Tags[y].Trim();
                    }
                }

                var fileTags = fileResult.SelectMany(x => x.Tags)
                    .GroupBy(x => x)
                    .Select(x => x.Key)
                    .ToList();

                foreach (var fileTag in fileTags)
                {
                    var planningTagExist = tags.FirstOrDefault(x =>
                        x.Name ==
                        fileTag);

                    if (planningTagExist == null)
                    {
                        var planningTag = new PlanningTag
                        {
                            Name = fileTag,
                            CreatedByUserId = userService.UserId,
                            UpdatedByUserId = userService.UserId
                        };
                        await planningTag.Create(context);
                    }
                }

                tags = await context.PlanningTags
                    .AsNoTracking()
                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                    .Select(x => new
                    {
                        x.Id,
                        Name = x.Name
                    }).ToListAsync();

                // Folders
                var danishLanguage = await dbContext.Languages.SingleOrDefaultAsync(x => x.LanguageCode == "da");
                var folders = await dbContext.Folders
                    .Join(dbContext.FolderTranslations,
                        folder => folder.Id,
                        translation => translation.FolderId,
                        (folder, translation) => new
                        {
                            folderWorkflowState = folder.WorkflowState,
                            translationWorkflowState = translation.WorkflowState,
                            folder.Id,
                            translation.Name,
                            translation.Description,
                            folder.ParentId,
                            translation.LanguageId
                        })
                    .AsNoTracking()
                    .Where(x => x.LanguageId == danishLanguage.Id)
                    .Where(x => x.folderWorkflowState != Constants.WorkflowStates.Removed)
                    .Select(x => new PlanningImportFolderModel
                    {
                        Id = x.Id,
                        Label = x.Name,
                        Description = x.Description,
                        ParentId = x.ParentId
                    }).ToListAsync();

                // Process folders
                foreach (var excelModel in fileResult)
                {
                    for (var i = 0; i < excelModel.Folders.Count; i++)
                    {
                        var level = i + 1;
                        var folderModel = excelModel.Folders[i];

                        if (level == 1)
                        {
                            var mainFolder = folders.FirstOrDefault(x =>
                                x.Label ==
                                folderModel.Label.Split("|")[0]
                                && x.ParentId == null);

                            if (mainFolder == null)
                            {
                                List<KeyValuePair<string, string>> names = new List<KeyValuePair<string, string>>();
                                List<KeyValuePair<string, string>> descriptions = new List<KeyValuePair<string, string>>();

                                var sourceNames = folderModel.Label.Split("|");
                                var sourceDescriptions = folderModel.Description.Split("|");
                                names.Add(new KeyValuePair<string, string>("da", sourceNames[0]));
                                descriptions.Add(new KeyValuePair<string, string>("da", sourceDescriptions[0]));
                                if (sourceNames.Length > 1)
                                {
                                    names.Add(new KeyValuePair<string, string>("en-US", sourceNames[1]));
                                }
                                else
                                {
                                    names.Add(new KeyValuePair<string, string>("en-US", ""));
                                }
                                if (sourceNames.Length > 2)
                                {
                                    names.Add(new KeyValuePair<string, string>("de-DE", sourceNames[2]));
                                }
                                else
                                {
                                    names.Add(new KeyValuePair<string, string>("de-DE", ""));
                                }


                                if (sourceDescriptions.Length > 1)
                                {
                                    descriptions.Add(new KeyValuePair<string, string>("en-US", sourceDescriptions[1]));
                                }
                                else
                                {
                                    descriptions.Add(new KeyValuePair<string, string>("en-US", ""));
                                }
                                if (sourceNames.Length > 2)
                                {
                                    descriptions.Add(new KeyValuePair<string, string>("de-DE", sourceDescriptions[2]));
                                }
                                else
                                {
                                    descriptions.Add(new KeyValuePair<string, string>("de-DE", ""));
                                }
                                folderModel.Id = await core.FolderCreate(
                                    names,
                                    descriptions,
                                    null);
                            }
                            else
                            {
                                folderModel.Id = mainFolder.Id;

                            }

                            folderModel.Description = folderModel.Description.Split("|")[0];
                            folderModel.Label = folderModel.Label.Split("|")[0];
                            folders.Add(folderModel);
                        }

                        if (level > 1)
                        {
                            var parentId = excelModel.Folders[i - 1].Id;

                            var sdkFolder = folders.FirstOrDefault(x =>
                                x.Label ==
                                folderModel.Label.Split("|")[0]
                                && x.ParentId == parentId);


                            if (sdkFolder == null)
                            {
                                List<KeyValuePair<string, string>> names = new List<KeyValuePair<string, string>>();
                                List<KeyValuePair<string, string>> descriptions = new List<KeyValuePair<string, string>>();

                                var sourceNames = folderModel.Label.Split("|");
                                var sourceDescriptions = folderModel.Description.Split("|");
                                names.Add(new KeyValuePair<string, string>("da", sourceNames[0]));
                                descriptions.Add(new KeyValuePair<string, string>("da", sourceDescriptions[0]));
                                if (sourceNames.Length > 1)
                                {
                                    names.Add(new KeyValuePair<string, string>("en-US", sourceNames[1]));
                                }
                                else
                                {
                                    names.Add(new KeyValuePair<string, string>("en-US", ""));
                                }
                                if (sourceNames.Length > 2)
                                {
                                    names.Add(new KeyValuePair<string, string>("de-DE", sourceNames[2]));
                                }
                                else
                                {
                                    names.Add(new KeyValuePair<string, string>("de-DE", ""));
                                }


                                if (sourceDescriptions.Length > 1)
                                {
                                    descriptions.Add(new KeyValuePair<string, string>("en-US", sourceDescriptions[1]));
                                }
                                else
                                {
                                    descriptions.Add(new KeyValuePair<string, string>("en-US", ""));
                                }
                                if (sourceNames.Length > 2)
                                {
                                    descriptions.Add(new KeyValuePair<string, string>("de-DE", sourceDescriptions[2]));
                                }
                                else
                                {
                                    descriptions.Add(new KeyValuePair<string, string>("de-DE", ""));
                                }

                                folderModel.Id = await core.FolderCreate(
                                    names,
                                    descriptions,
                                    parentId);
                            }
                            else
                            {
                                folderModel.Id = sdkFolder.Id;
                            }

                            folderModel.ParentId = parentId;

                            folderModel.Description = folderModel.Description.Split("|")[0];
                            folderModel.Label = folderModel.Label.Split("|")[0];

                            folders.Add(folderModel);
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
                            var planningTagExist = tags.FirstOrDefault(x => x.Name == tagName);

                            if (planningTagExist != null)
                            {
                                tagIds.Add(planningTagExist.Id);
                            }
                        }
                    }

                    var planningNameFromExcelModel = excelModel.PlanningName.Split("|").First();

                    if (string.IsNullOrEmpty(planningNameFromExcelModel))
                    {
                        continue;
                    }

                    var sdkFolder = excelModel.Folders.Last();
                    // Find planning name
                    var planningName = context.PlanningNameTranslation
                        .Join(context.Plannings,
                            planningNameTranslation => planningNameTranslation.PlanningId,
                            plannings => plannings.Id,
                            (planningNameTranslation, planning) => new
                            {
                                planning.SdkFolderId,
                                planningNameTranslation.Name,
                                planningNameTranslation.PlanningId,
                                planning.WorkflowState
                            }).FirstOrDefault(x =>
                            x.Name == planningNameFromExcelModel
                            && x.SdkFolderId == sdkFolder.Id
                            && x.WorkflowState != Constants.WorkflowStates.Removed);

                    if (planningName != null)
                    {
                        var planningFromDb = await context.Plannings
                            .Where(x => x.Id == planningName.PlanningId)
                            .FirstAsync();

                        var planningTranslations = context.PlanningNameTranslation
                            .Where(x => x.PlanningId == planningFromDb.Id)
                            .ToList();

                        // create or update name tranlations planning
                        var i = 1;
                        foreach (var translationText in excelModel.PlanningName.Split("|"))
                        {
                            var language = await dbContext.Languages.SingleAsync(x => x.Id == i);
                            var planningNameTranslation =
                                planningTranslations
                                    .Where(x => x.PlanningId == planningFromDb.Id)
                                    .FirstOrDefault(x => x.LanguageId == i);
                            if (planningNameTranslation == null)
                            {
                                planningNameTranslation = new PlanningNameTranslation
                                {
                                    Name = translationText,
                                    LanguageId = language.Id,
                                    PlanningId = planningFromDb.Id,
                                    CreatedByUserId = userService.UserId,
                                    UpdatedByUserId = userService.UserId
                                };
                                await planningNameTranslation.Create(context);
                            }
                            else
                            {
                                planningNameTranslation.UpdatedByUserId = userService.UserId;
                                planningNameTranslation.WorkflowState = Constants.WorkflowStates.Created;

                                await planningNameTranslation.Update(context);
                            }

                            i++;
                        }

                        if (excelModel.DayOfMonth != null && planningFromDb.DayOfMonth != excelModel.DayOfMonth)
                        {
                            planningFromDb.DayOfMonth = excelModel.DayOfMonth;
                        }
                        if (excelModel.DayOfWeek != null && planningFromDb.DayOfWeek != excelModel.DayOfWeek)
                        {
                            planningFromDb.DayOfWeek = excelModel.DayOfWeek;
                        }
                        if (excelModel.RepeatEvery != null && planningFromDb.RepeatEvery != excelModel.RepeatEvery)
                        {
                            planningFromDb.RepeatEvery = (int) excelModel.RepeatEvery;
                        }
                        if (excelModel.RepeatType != null && planningFromDb.RepeatType != excelModel.RepeatType)
                        {
                            planningFromDb.RepeatType = (RepeatType) excelModel.RepeatType;
                        }
                        if (excelModel.RepeatUntil != null && planningFromDb.RepeatUntil != excelModel.RepeatUntil)
                        {
                            planningFromDb.RepeatUntil = excelModel.RepeatUntil;
                        }
                        planningFromDb.UpdatedByUserId = userService.UserId;
                        planningFromDb.StartDate = DateTime.Now;
                        planningFromDb.WorkflowState = Constants.WorkflowStates.Created;
                        planningFromDb.ShowExpireDate = true;

                        var tagsIdForAddToPlanningTags = planningFromDb.PlanningsTags
                            .Where(x => tagIds.Any(y => x.PlanningTagId != y)).ToList();

                        var tagsIdForRemoveInPlanningTags = tagIds
                            .Where(x => planningFromDb.PlanningsTags.Any(y => x != y.PlanningTagId)).ToList();
                        if (tagsIdForAddToPlanningTags.Any())
                        {
                            foreach (var tagsIdForAddToPlanningTag in tagsIdForAddToPlanningTags)
                            {
                                planningFromDb.PlanningsTags.Add(
                                    new PlanningsTags
                                    {
                                        CreatedByUserId = userService.UserId,
                                        UpdatedByUserId = userService.UserId,
                                        PlanningTagId = tagsIdForAddToPlanningTag.PlanningTagId
                                    });
                            }
                        }
                        if (tagsIdForRemoveInPlanningTags.Any())
                        {
                            foreach (var tagsIdForAddToPlanningTag in tagsIdForAddToPlanningTags)
                            {
                                await planningFromDb.PlanningsTags
                                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                                    .FirstOrDefault(x=> x.PlanningTagId == tagsIdForAddToPlanningTag.PlanningTagId)
                                    .Delete(context);
                            }
                        }
                        await planningFromDb.Update(context);
                    }
                    else
                    {
                        sdkFolder = excelModel.Folders.Last();
                        var newPlanning = new Planning
                        {
                            CreatedByUserId = userService.UserId,
                            RepeatUntil = excelModel.RepeatUntil,
                            DayOfWeek = excelModel.DayOfWeek,
                            DayOfMonth = excelModel.DayOfMonth,
                            Enabled = true,
                            RelatedEFormId = (int)excelModel.EFormId,
                            RelatedEFormName = excelModel.EFormName,
                            PlanningsTags = new List<PlanningsTags>(),
                            SdkFolderName = sdkFolder?.Label,
                            SdkFolderId = sdkFolder?.Id,
                            StartDate = DateTime.UtcNow,
                            RepeatEvery = excelModel.RepeatEvery ?? 1,
                            RepeatType = excelModel.RepeatType ?? RepeatType.Month,
                            IsLocked = false,
                            IsEditable = true,
                            IsHidden = false,
                            ShowExpireDate = true
                        };

                        foreach (var tagId in tagIds)
                        {
                            newPlanning.PlanningsTags.Add(
                                new PlanningsTags
                                {
                                    CreatedAt = DateTime.UtcNow,
                                    CreatedByUserId = userService.UserId,
                                    UpdatedAt = DateTime.UtcNow,
                                    UpdatedByUserId = userService.UserId,
                                    Version = 1,
                                    PlanningTagId = tagId
                                });
                        }

                        await newPlanning.Create(context);

                        var i = 1;
                        foreach (var translationText in excelModel.PlanningName.Split("|"))
                        {
                            var language = await dbContext.Languages.SingleAsync(x => x.Id == i);
                            var planningNameTranslation = new PlanningNameTranslation()
                            {
                                Name = translationText,
                                LanguageId = language.Id,
                                PlanningId = newPlanning.Id
                            };
                            await planningNameTranslation.Create(context);
                            i += 1;
                        }
                    }

                }
            }
            catch (Exception ex)
            {
                SentrySdk.CaptureException(ex);
                logger.LogError(ex.Message);
                logger.LogTrace(ex.StackTrace);
                throw;
            }

            result.Message = itemsPlanningLocalizationService.GetString("ImportCompletedSuccessfully");

            return new OperationDataResult<ExcelParseResult>(
                true,
                result);
        }
        catch (Exception e)
        {
            SentrySdk.CaptureException(e);
            logger.LogError(e.Message);
            logger.LogTrace(e.StackTrace);
            return new OperationDataResult<ExcelParseResult>(false,
                itemsPlanningLocalizationService.GetString("ErrorWhileImportingExcelFile"));
        }
    }
}