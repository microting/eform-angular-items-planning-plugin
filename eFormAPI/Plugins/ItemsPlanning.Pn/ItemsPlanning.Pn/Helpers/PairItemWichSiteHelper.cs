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

using Microting.eForm.Infrastructure;
using Microting.eForm.Infrastructure.Data.Entities;
using Microting.ItemsPlanningBase.Infrastructure.Enums;

namespace ItemsPlanning.Pn.Helpers
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using Microting.eForm.Infrastructure.Constants;
    using Microting.eFormApi.BasePn.Abstractions;
    using Microting.ItemsPlanningBase.Infrastructure.Data;
    using Microting.ItemsPlanningBase.Infrastructure.Data.Entities;
    using Infrastructure.Models.Planning;

    public class PairItemWichSiteHelper
    {
        private readonly ItemsPlanningPnDbContext _dbContext;
        private readonly IEFormCoreService _coreService;

        public PairItemWichSiteHelper(
            ItemsPlanningPnDbContext dbContext,
            IEFormCoreService coreService)
        {
            _dbContext = dbContext;
            _coreService = coreService;
        }

        public async Task Pair(PlanningPnModel planningPnModel, int assignmentSiteId, int relatedEFormId, int planningId)
        {
            var sdkCore =
                await _coreService.GetCore();
            await using var sdkDbContext = sdkCore.DbContextHelper.GetDbContext();
            var sdkSite = await sdkDbContext.Sites.SingleAsync(x => x.Id == assignmentSiteId);
            var language = await sdkDbContext.Languages.SingleAsync(x => x.Id == sdkSite.LanguageId);
            var mainElement = await sdkCore.ReadeForm(relatedEFormId, language);

            var folder = await sdkDbContext.Folders.SingleAsync(x => x.Id == planningPnModel.Folder.EFormSdkFolderId);
            var folderId = folder.MicrotingUid.ToString();

            var planning = await _dbContext.Plannings.SingleAsync(x => x.Id == planningId);

            // get planning cases
            var planningCase = await _dbContext.PlanningCases
                .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                .Where(x => x.WorkflowState != Constants.WorkflowStates.Retracted)
                .Where(x => x.WorkflowState != Constants.WorkflowStates.Processed)
                .Where(x => x.PlanningId == planningPnModel.Id)
                .FirstOrDefaultAsync(x => x.MicrotingSdkeFormId == relatedEFormId);

            if (planning.RepeatEvery == 0 && planning.RepeatType == RepeatType.Day)
            {
                planningCase = new PlanningCase()
                {
                    PlanningId = planningPnModel.Id,
                    Status = 66,
                    MicrotingSdkeFormId = relatedEFormId
                };
                await planningCase.Create(_dbContext);
            }

            if (planningCase == null)
            {
                planningCase = new PlanningCase()
                {
                    PlanningId = planningPnModel.Id,
                    Status = 66,
                    MicrotingSdkeFormId = relatedEFormId
                };
                await planningCase.Create(_dbContext);
            }

            var casesToDelete = await _dbContext.PlanningCaseSites
                .Where(x => x.PlanningId == planningPnModel.Id
                            && x.MicrotingSdkSiteId == assignmentSiteId
                            && x.WorkflowState !=
                            Constants.WorkflowStates.Retracted)
                .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                .ToListAsync();

            foreach (var caseToDelete in casesToDelete)
            {
                var theCase =
                    await sdkDbContext.Cases.SingleOrDefaultAsync(x => x.Id == caseToDelete.MicrotingSdkCaseId);
                if (theCase != null)
                {
                    if (theCase.MicrotingUid != null)
                        await sdkCore.CaseDelete((int) theCase.MicrotingUid);
                }
                else
                {
                    var checkListSite =
                        await sdkDbContext.CheckListSites.SingleOrDefaultAsync(x =>
                            x.Id == caseToDelete.MicrotingCheckListSitId);
                    if (checkListSite != null)
                    {
                        await sdkCore.CaseDelete(checkListSite.MicrotingUid);
                    }
                }

                caseToDelete.WorkflowState = Constants.WorkflowStates.Retracted;
                await caseToDelete.Update(_dbContext);
            }

            if (planningCase.Status == 100)
            {
                var planningCaseSite =
                    await _dbContext.PlanningCaseSites.SingleOrDefaultAsync(x =>
                        x.PlanningCaseId == planningCase.Id
                        && x.MicrotingSdkSiteId == assignmentSiteId
                        && x.WorkflowState != Constants.WorkflowStates.Removed);

                if (planningCaseSite == null)
                {
                    planningCaseSite = new PlanningCaseSite()
                    {
                        MicrotingSdkSiteId = assignmentSiteId,
                        MicrotingSdkeFormId = relatedEFormId,
                        Status = 2,
                        PlanningId = planningPnModel.Id,
                        PlanningCaseId = planningCase.Id
                    };

                    await planningCaseSite.Create(_dbContext);
                }

                planningCaseSite.Status = planningCaseSite.Status == 100 ? planningCaseSite.Status : 2;
                planningCaseSite.WorkflowState = Constants.WorkflowStates.Retracted;
                await planningCaseSite.Update(_dbContext);
            }

            if (planningCase.Status != 100)
            {
                var translation = _dbContext.PlanningNameTranslation
                    .Single(x => x.LanguageId == language.Id && x.PlanningId == planningPnModel.Id).Name;

                mainElement.Label = string.IsNullOrEmpty(planningPnModel.PlanningNumber)
                    ? ""
                    : planningPnModel.PlanningNumber;
                if (!string.IsNullOrEmpty(translation))
                {
                    mainElement.Label +=
                        string.IsNullOrEmpty(mainElement.Label) ? $"{translation}" : $" - {translation}";
                }

                if (!string.IsNullOrEmpty(planningPnModel.BuildYear))
                {
                    mainElement.Label += string.IsNullOrEmpty(mainElement.Label)
                        ? $"{planningPnModel.BuildYear}"
                        : $" - {planningPnModel.BuildYear}";
                }

                if (!string.IsNullOrEmpty(planningPnModel.Type))
                {
                    mainElement.Label += string.IsNullOrEmpty(mainElement.Label)
                        ? $"{planningPnModel.Type}"
                        : $" - {planningPnModel.Type}";
                }

                if (mainElement.ElementList.Count == 1)
                {
                    mainElement.ElementList[0].Label = mainElement.Label;
                }
                mainElement.CheckListFolderName = folderId;
                mainElement.StartDate = DateTime.Now.ToUniversalTime();
                mainElement.EndDate = DateTime.Now.AddYears(10).ToUniversalTime();
                if (planning.RepeatType == RepeatType.Day && planning.RepeatEvery == 0)
                {
                    mainElement.Repeated = 0;
                }

                if (planning.RepeatEvery == -1)
                {
                    mainElement.Repeated = -1;
                }

                // mainElement.PushMessageBody = mainElement.Label;
                // mainElement.PushMessageTitle = folder.Name;
                // if (folder.ParentId != null)
                // {
                //     var parentFolder = await sdkDbContext.Folders.SingleAsync(x => x.Id == folder.ParentId);
                //     mainElement.PushMessageTitle = parentFolder.Name;
                //     mainElement.PushMessageBody = $"{folder.Name}\n{mainElement.Label}";
                // }

                var planningCaseSite =
                    await _dbContext.PlanningCaseSites.SingleOrDefaultAsync(x =>
                        x.PlanningCaseId == planningCase.Id
                        && x.MicrotingSdkSiteId == assignmentSiteId
                        && x.WorkflowState != Constants.WorkflowStates.Retracted
                        && x.WorkflowState != Constants.WorkflowStates.Removed);

                if (planningCaseSite == null)
                {
                    planningCaseSite = new PlanningCaseSite()
                    {
                        MicrotingSdkSiteId = assignmentSiteId,
                        MicrotingSdkeFormId = relatedEFormId,
                        Status = 66,
                        PlanningId = planningPnModel.Id,
                        PlanningCaseId = planningCase.Id
                    };

                    await planningCaseSite.Create(_dbContext);
                }

                if (planningCaseSite.MicrotingSdkCaseDoneAt.HasValue)
                {
                    var unixTimestamp = (long) (planningCaseSite.MicrotingSdkCaseDoneAt.Value
                            .Subtract(new DateTime(1970, 1, 1)))
                        .TotalSeconds;

                    mainElement.ElementList[0].Description.InderValue = unixTimestamp.ToString();
                }

                if (planningCaseSite.MicrotingSdkCaseId < 1 && planning.StartDate <= DateTime.Now)
                {
                    // ReSharper disable once PossibleInvalidOperationException
                    if (planning.PushMessageOnDeployment)
                    {
                        string body = "";
                        folder = await getTopFolderName((int) planning.SdkFolderId, sdkDbContext);
                        if (folder != null)
                        {
                            planning.SdkFolderId = sdkDbContext.Folders
                                .FirstOrDefault(y => y.Id == planning.SdkFolderId)
                                ?.Id;
                            FolderTranslation folderTranslation =
                                await sdkDbContext.FolderTranslations.SingleOrDefaultAsync(x =>
                                    x.FolderId == folder.Id && x.LanguageId == sdkSite.LanguageId);
                            body = $"{folderTranslation.Name} ({sdkSite.Name};{DateTime.Now:dd.MM.yyyy})";
                        }

                        PlanningNameTranslation planningNameTranslation =
                            await _dbContext.PlanningNameTranslation.SingleOrDefaultAsync(x =>
                                x.PlanningId == planning.Id
                                && x.LanguageId == sdkSite.LanguageId);

                        mainElement.PushMessageBody = body;
                        mainElement.PushMessageTitle = planningNameTranslation.Name;
                    }
                    var caseId = await sdkCore.CaseCreate(mainElement, "", (int) sdkSite.MicrotingUid, null);
                    if (caseId != null)
                    {
                        if (sdkDbContext.Cases.Any(x => x.MicrotingUid == caseId))
                        {
                            planningCaseSite.MicrotingSdkCaseId =
                                sdkDbContext.Cases.Single(x => x.MicrotingUid == caseId).Id;
                        }
                        else
                        {
                            planningCaseSite.MicrotingCheckListSitId =
                                sdkDbContext.CheckListSites.Single(x => x.MicrotingUid == caseId).Id;
                        }
                        await planningCaseSite.Update(_dbContext);
                    }
                }

                var now = DateTime.UtcNow;
                switch (planning.RepeatType)
                {
                    case RepeatType.Day:
                        planning.NextExecutionTime = now.AddDays(planning.RepeatEvery);
                        break;
                    case RepeatType.Week:
                        var startOfWeek =
                            new DateTime(now.Year, now.Month, now.Day, 0, 0, 0).StartOfWeek(
                                (DayOfWeek) planning.DayOfWeek);
                        planning.NextExecutionTime = startOfWeek.AddDays(planning.RepeatEvery * 7);
                        break;
                    case RepeatType.Month:
                        planning.DayOfMonth ??= 1;
                        if (planning.DayOfMonth == 0)
                        {
                            planning.DayOfMonth = 1;
                        }
                        var startOfMonth = new DateTime(now.Year, now.Month, (int) planning.DayOfMonth, 0, 0, 0);
                        planning.NextExecutionTime = startOfMonth.AddMonths(planning.RepeatEvery);
                        break;
                }
                planning.LastExecutedTime = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0);
                await planning.Update(_dbContext);
            }
        }

        private async Task<Folder> getTopFolderName(int folderId, MicrotingDbContext dbContext)
        {
            var result = await dbContext.Folders.FirstOrDefaultAsync(y => y.Id == folderId);
            if (result.ParentId != null)
            {
                result = await getTopFolderName((int)result.ParentId, dbContext);
            }
            return result;
        }
    }

    public static class DateTimeExtensions
    {
        public static DateTime StartOfWeek(this DateTime dt, DayOfWeek startOfWeek)
        {
            int diff = (7 + (dt.DayOfWeek - startOfWeek)) % 7;
            return dt.AddDays(-1 * diff).Date;
        }
    }
}