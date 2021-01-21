/*
The MIT License (MIT)

Copyright (c) 2007 - 2019 Microting A/S

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

using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microting.eForm.Infrastructure;
using Microting.eForm.Infrastructure.Data.Entities;
using Microting.eForm.Infrastructure.Models;
using Microting.ItemsPlanningBase.Infrastructure.Data.Entities;
using UploadedData = Microting.eForm.Infrastructure.Models.UploadedData;

namespace ItemsPlanning.Pn.Services.ItemsPlanningReportService
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;
    using Infrastructure.Models.Report;
    using ItemsPlanningLocalizationService;
    using Microsoft.AspNetCore.Http;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Microting.eForm.Infrastructure.Constants;
    using Microting.eFormApi.BasePn.Abstractions;
    using Microting.eFormApi.BasePn.Infrastructure.Models.API;
    using Microting.eFormApi.BasePn.Infrastructure.Models.Application.CasePosts;
    using Microting.ItemsPlanningBase.Infrastructure.Data;
    using WordService;

    public class ItemsPlanningReportService : IItemsPlanningReportService
    {
        private readonly ILogger<ItemsPlanningReportService> _logger;
        private readonly IItemsPlanningLocalizationService _itemsPlanningLocalizationService;
        private readonly IWordService _wordService;
        private readonly IEFormCoreService _coreHelper;
        private readonly ICasePostBaseService _casePostBaseService;
        private readonly ItemsPlanningPnDbContext _dbContext;
        private readonly IUserService _userService;

        // ReSharper disable once SuggestBaseTypeForParameter
        public ItemsPlanningReportService(
            IItemsPlanningLocalizationService itemsPlanningLocalizationService,
            ILogger<ItemsPlanningReportService> logger,
            IEFormCoreService coreHelper,
            IWordService wordService,
            ICasePostBaseService casePostBaseService,
            ItemsPlanningPnDbContext dbContext,
            IUserService userService)
        {
            _itemsPlanningLocalizationService = itemsPlanningLocalizationService;
            _logger = logger;
            _coreHelper = coreHelper;
            _wordService = wordService;
            _casePostBaseService = casePostBaseService;
            _dbContext = dbContext;
            _userService = userService;
        }

        public async Task<OperationDataResult<List<ReportEformModel>>> GenerateReport(GenerateReportModel model)
        {
            try
            {
                TimeZoneInfo timeZoneInfo = await _userService.GetCurrentUserTimeZoneInfo();
                var core = await _coreHelper.GetCore();
                await using var sdkDbContext = core.DbContextHelper.GetDbContext();
                //var casesQuery = microtingDbContext.cases
                //    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                //    .Include(x => x.Site)
                //    .AsQueryable();
                DateTime fromDate = new DateTime(model.DateFrom.Value.Year, model.DateFrom.Value.Month,
                    model.DateFrom.Value.Day, 0, 0, 0);
                DateTime toDate = new DateTime(model.DateTo.Value.Year, model.DateTo.Value.Month,
                    model.DateTo.Value.Day, 23, 59, 59);

                var casesQuery = _dbContext.PlanningCases
                    .Include(x => x.Item)
                    .ThenInclude(x => x.Planning)
                    .ThenInclude(x => x.PlanningsTags)
                    .Where(x => x.Status == 100)
                    .AsQueryable();

                if (model.DateFrom != null)
                {
                    casesQuery = casesQuery.Where(x =>
                        x.MicrotingSdkCaseDoneAt >= fromDate);
                }

                if (model.DateTo != null)
                {
                    casesQuery = casesQuery.Where(x =>
                        x.MicrotingSdkCaseDoneAt <= toDate);
                }

                if (model.TagIds.Count > 0)
                {
                    foreach (var tagId in model.TagIds)
                    {
                        casesQuery = casesQuery.Where(x =>
                            x.Item.Planning.PlanningsTags.Any(y => y.PlanningTagId == tagId && y.WorkflowState != Constants.WorkflowStates.Removed));
                    }
                }
                var groupedCaseCheckListIds = casesQuery.GroupBy(x => x.MicrotingSdkeFormId).Select(x => x.Key).ToList();

                var checkLists = await sdkDbContext.CheckLists
                    .FromSqlRaw($"SELECT * FROM CheckLists WHERE" +
                                $" Id IN ({string.Join(",", groupedCaseCheckListIds)})" +
                                $" ORDER BY ReportH1  * 1, ReportH2 * 1, ReportH3 * 1, ReportH4 * 1").ToListAsync();

                var itemCases = await casesQuery
                    .OrderBy(x => x.Item.Planning.RelatedEFormName)
                    .ToListAsync();

                var groupedCases = itemCases
                    .GroupBy(x => x.MicrotingSdkeFormId)
                    .Select(x => new
                    {
                        templateId = x.Key,
                        cases = x.ToList(),
                    })
                    .ToList();


                var result = new List<ReportEformModel>();
                // Exclude field types: None, Picture, Audio, Movie, Signature, Show PDF, FieldGroup, SaveButton
                List<int> excludedFieldTypeIds = new List<int>()
                {
                    3,5,6,7,12,16,17,18
                };
                var localeString = await _userService.GetCurrentUserLocale();
                Language language = sdkDbContext.Languages.Single(x => x.LanguageCode.ToLower() == localeString.ToLower());
                //foreach (var groupedCase in groupedCases)
                foreach (var checkList in checkLists)
                {
                    //var template = await sdkDbContext.CheckLists.SingleAsync(x => x.Id == groupedCase.templateId);
                    var groupedCase = groupedCases.SingleOrDefault(x => x.templateId == checkList.Id);

                    if (groupedCase != null)
                    {
                        // Posts - check mailing in main app
                    var reportModel = new ReportEformModel
                    {
                        TemplateName = checkList.Label,
                        FromDate = $"{fromDate:yyyy-MM-dd}",
                        ToDate = $"{toDate:yyyy-MM-dd}",
                        TextHeaders = new ReportEformTextHeaderModel(),
                        TableName = sdkDbContext.CheckListTranslations.Single(x => x.LanguageId == language.Id && x.CheckListId == checkList.Id).Text,
                    };
                    // first pass
                    if (result.Count <= 0)
                    {
                        reportModel.TextHeaders.Header1 = checkList.ReportH1 ?? "";
                        reportModel.TextHeaders.Header2 = checkList.ReportH2 ?? "";
                        reportModel.TextHeaders.Header3 = checkList.ReportH3 ?? "";
                        reportModel.TextHeaders.Header4 = checkList.ReportH4 ?? "";
                        reportModel.TextHeaders.Header5 = checkList.ReportH5 ?? "";
                    }
                    else // other pass
                    {
                        var header1 = result.LastOrDefault(x => x.TextHeaders.Header1 != default).TextHeaders.Header1;
                        var header2 = result.LastOrDefault(x => x.TextHeaders.Header2 != default).TextHeaders.Header2;
                        var header3 = result.LastOrDefault(x => x.TextHeaders.Header3 != default).TextHeaders.Header3;
                        var header4 = result.LastOrDefault(x => x.TextHeaders.Header4 != default).TextHeaders.Header4;
                        var header5 = result.LastOrDefault(x => x.TextHeaders.Header5 != default).TextHeaders.Header5;

                        // if not find or finded and templateHeader not equal
                        if (header1 == default || checkList.ReportH1 != header1)
                        {
                            reportModel.TextHeaders.Header1 = checkList.ReportH1 ?? "";
                        }

                        if (header2 == default || checkList.ReportH2 != header2)
                        {
                            reportModel.TextHeaders.Header2 = checkList.ReportH2 ?? "";
                        }

                        if (header3 == default || checkList.ReportH3 != header3)
                        {
                            reportModel.TextHeaders.Header3 = checkList.ReportH3 ?? "";
                        }

                        if (header4 == default || checkList.ReportH4 != header4)
                        {
                            reportModel.TextHeaders.Header4 = checkList.ReportH4 ?? "";
                        }

                        if (header5 == default || checkList.ReportH5 != header5)
                        {
                            reportModel.TextHeaders.Header5 = checkList.ReportH5 ?? "";
                        }

                    }

                    var fields = await core.Advanced_TemplateFieldReadAll(
                        checkList.Id, language);

                    foreach (var fieldDto in fields)
                    {
                        if(fieldDto.FieldType == Constants.FieldTypes.None)
                        {
                            FieldTranslation fieldTranslation =
                                await sdkDbContext.FieldTranslations.SingleAsync(x =>
                                    x.FieldId == fieldDto.Id && x.LanguageId == language.Id);
                            reportModel.DescriptionBlocks.Add(fieldTranslation.Description);
                        }
                        if (!excludedFieldTypeIds.Contains(fieldDto.FieldTypeId))
                        {
                            FieldTranslation fieldTranslation =
                                await sdkDbContext.FieldTranslations.SingleAsync(x =>
                                    x.FieldId == fieldDto.Id && x.LanguageId == language.Id);
                            KeyValuePair<int, string> kvp = new KeyValuePair<int, string>(fieldDto.Id, fieldTranslation.Text);

                            reportModel.ItemHeaders.Add(kvp);
                        }
                    }

                    // images
                    var templateCaseIds = groupedCase.cases.Select(x => (int?)x.MicrotingSdkCaseId).ToArray();
                    var imagesForEform = await sdkDbContext.FieldValues
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .Where(x => x.Field.FieldTypeId == 5)
                        .Where(x => templateCaseIds.Contains(x.CaseId))
                        .OrderBy(x => x.CaseId)
                        .ToListAsync();

                    foreach (var imageField in imagesForEform)
                    {
                        if (imageField.UploadedDataId != null)
                        {
                            var planningCase = groupedCase.cases.Single(x => x.MicrotingSdkCaseId == imageField.CaseId);
                            DateTime doneAt = (DateTime)planningCase.MicrotingSdkCaseDoneAt;
                            doneAt = TimeZoneInfo.ConvertTimeFromUtc(doneAt, timeZoneInfo);

                            PlanningNameTranslation planningNameTranslation =
                                await _dbContext.PlanningNameTranslation.SingleAsync(x =>
                                    x.PlanningId == planningCase.Item.PlanningId && x.LanguageId == language.Id);
                            //var label = $"{imageField.CaseId} - {doneAt:yyyy-MM-dd HH:mm:ss}; {planningNameTranslation.Name}"; // Disabling date until we have correct date pr image.
                            var label = $"{imageField.CaseId}; {planningNameTranslation.Name}";
                            string geoTag = "";
                            if (!string.IsNullOrEmpty((imageField.Latitude)))
                            {
                                geoTag =
                                    $"https://www.google.com/maps/place/{imageField.Latitude},{imageField.Longitude}";
                            }
                            var keyList = new List<string>();
                            keyList.Add(imageField.CaseId.ToString());
                            keyList.Add(label);
                            var list = new List<string>();
                            Microting.eForm.Infrastructure.Data.Entities.UploadedData uploadedData =
                                await sdkDbContext.UploadedDatas.SingleAsync(x => x.Id == imageField.UploadedDataId);
                            list.Add(uploadedData.FileName);
                            list.Add(geoTag);
                            reportModel.ImageNames.Add(new KeyValuePair<List<string>, List<string>>(keyList, list));
                        }
                    }

                    // posts
                    var casePostRequest = new CasePostsRequestCommonModel
                    {
                        Offset = 0,
                        PageSize = int.MaxValue,
                        TemplateId = checkList.Id,
                    };

                    var casePostListResult = await _casePostBaseService.GetCommonPosts(casePostRequest);

                    if (!casePostListResult.Success)
                    {
                        return new OperationDataResult<List<ReportEformModel>>(
                            false,
                            casePostListResult.Message);
                    }

                    foreach (var casePostCommonModel in casePostListResult.Model.Entities)
                    {
                        reportModel.Posts.Add(new ReportEformPostModel
                        {
                            CaseId = casePostCommonModel.CaseId,
                            PostId = casePostCommonModel.PostId,
                            Comment = casePostCommonModel.Text,
                            SentTo = casePostCommonModel.ToRecipients,
                            SentToTags = casePostCommonModel.ToRecipientsTags,
                            PostDate = casePostCommonModel.PostDate
                        });
                    }

                    // add cases
                    foreach (var planningCase in groupedCase.cases.OrderBy(x => x.MicrotingSdkCaseDoneAt))
                    {
                        PlanningNameTranslation planningNameTranslation =
                            await _dbContext.PlanningNameTranslation.SingleAsync(x =>
                                x.PlanningId == planningCase.Item.PlanningId && x.LanguageId == language.Id);
                        var item = new ReportEformItemModel
                        {
                            Id = planningCase.Id,
                            MicrotingSdkCaseId = planningCase.MicrotingSdkCaseId,
                            MicrotingSdkCaseDoneAt = TimeZoneInfo.ConvertTimeFromUtc((DateTime) planningCase.MicrotingSdkCaseDoneAt, timeZoneInfo),
                            eFormId = planningCase.MicrotingSdkeFormId,
                            DoneBy = planningCase.DoneByUserName,
                            ItemName = planningNameTranslation.Name,
                            ItemDescription = planningCase.Item.Description,
                        };


                        var caseFields = await core.Advanced_FieldValueReadList(
                            new List<int>()
                            {
                                planningCase.MicrotingSdkCaseId
                            }, language);

                        foreach (var itemHeader in reportModel.ItemHeaders)
                        {
                            var caseField = caseFields
                                .FirstOrDefault(x => x.FieldId == itemHeader.Key);

                            if (caseField != null)
                            {
                                switch (caseField.FieldType)
                                {
                                    case Constants.FieldTypes.MultiSelect:
                                        item.CaseFields.Add(caseField.ValueReadable.Replace("|", "<br>"));
                                        break;
                                    case Constants.FieldTypes.EntitySearch:
                                    case Constants.FieldTypes.EntitySelect:
                                    case Constants.FieldTypes.SingleSelect:
                                        item.CaseFields.Add(caseField.ValueReadable);
                                        break;
                                    default:
                                        item.CaseFields.Add(caseField.Value);
                                        break;
                                }
                            }
                        }

                        item.ImagesCount = await sdkDbContext.FieldValues
                            .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                            .Where(x => x.Field.FieldTypeId == 5)
                            .Where(x => x.CaseId == planningCase.MicrotingSdkCaseId)
                            .Select(x => x.Id)
                            .CountAsync();

                        item.PostsCount = casePostListResult.Model.Entities
                            .Where(x => x.CaseId == planningCase.MicrotingSdkCaseId)
                            .Select(x => x.PostId)
                            .Count();

                        reportModel.Items.Add(item);
                    }

                    result.Add(reportModel);
                    }
                }

                return new OperationDataResult<List<ReportEformModel>>(true, result);
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                _logger.LogError(e.Message);
                return new OperationDataResult<List<ReportEformModel>>(false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileGeneratingReport"));
            }
        }

        public async Task<OperationDataResult<Stream>> GenerateReportFile(GenerateReportModel model)
        {
            try
            {
                var reportDataResult = await GenerateReport(model);
                if (!reportDataResult.Success)
                {
                    return new OperationDataResult<Stream>(false, reportDataResult.Message);
                }

                var wordDataResult = await _wordService
                    .GenerateWordDashboard(reportDataResult.Model);

                if (!wordDataResult.Success)
                {
                    return new OperationDataResult<Stream>(false, wordDataResult.Message);
                }

                return new OperationDataResult<Stream>(true, wordDataResult.Model);
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                _logger.LogError(e.Message);
                return new OperationDataResult<Stream>(
                    false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileGeneratingReportFile"));
            }
        }
    }
}