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

        // ReSharper disable once SuggestBaseTypeForParameter
        public ItemsPlanningReportService(
            IItemsPlanningLocalizationService itemsPlanningLocalizationService,
            ILogger<ItemsPlanningReportService> logger,
            IEFormCoreService coreHelper,
            IWordService wordService,
            ICasePostBaseService casePostBaseService,
            ItemsPlanningPnDbContext dbContext)
        {
            _itemsPlanningLocalizationService = itemsPlanningLocalizationService;
            _logger = logger;
            _coreHelper = coreHelper;
            _wordService = wordService;
            _casePostBaseService = casePostBaseService;
            _dbContext = dbContext;
        }

        public async Task<OperationDataResult<List<ReportEformModel>>> GenerateReport(GenerateReportModel model)
        {
            try
            {
                var core = await _coreHelper.GetCore();
                await using var microtingDbContext = core.dbContextHelper.GetDbContext();
                //var casesQuery = microtingDbContext.cases
                //    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                //    .Include(x => x.Site)
                //    .AsQueryable();

                var casesQuery = _dbContext.PlanningCases
                    .Include(x => x.Item)
                    .ThenInclude(x => x.Planning)
                    .Where(x => x.Status == 100)
                    .AsQueryable();

                if (model.DateFrom != null)
                {
                    casesQuery = casesQuery.Where(x =>
                        x.CreatedAt >= new DateTime(model.DateFrom.Value.Year, model.DateFrom.Value.Month,
                            model.DateFrom.Value.Day, 0, 0, 0));
                }

                if (model.DateTo != null)
                {
                    casesQuery = casesQuery.Where(x =>
                        x.CreatedAt <= new DateTime(model.DateTo.Value.Year, model.DateTo.Value.Month,
                            model.DateTo.Value.Day, 23, 59, 59));
                }

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
                foreach (var groupedCase in groupedCases)
                {
                    var template = await core.TemplateRead(groupedCase.templateId);
                    
                    // Posts - check mailing in main app
                    var reportModel = new ReportEformModel
                    {
                        Name = template.Label,
                    };

                    var fields = await core.Advanced_TemplateFieldReadAll(
                        groupedCase.templateId);

                    foreach (var fieldDto in fields)
                    {
                        if (!excludedFieldTypeIds.Contains(fieldDto.FieldTypeId))
                        {
                            KeyValuePair<int, string> kvp = new KeyValuePair<int, string>(fieldDto.Id, fieldDto.Label);

                            reportModel.ItemHeaders.Add(kvp);
                        }
                    }
                    
                    // images
                    var templateCaseIds = groupedCase.cases.Select(x => (int?)x.MicrotingSdkCaseId).ToArray();
                    var imagesForEform = await microtingDbContext.field_values
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .Where(x => x.Field.FieldTypeId == 5)
                        .Where(x => templateCaseIds.Contains(x.CaseId))
                        .ToListAsync();

                    foreach (var imageField in imagesForEform)
                    {
                        if (!string.IsNullOrEmpty(imageField.UploadedData?.FileName))
                        {
                            var bla = groupedCase.cases.Single(x => x.MicrotingSdkCaseId == imageField.CaseId);
                            DateTime doneAt = (DateTime)bla.MicrotingSdkCaseDoneAt;
                            var label = $"{doneAt:yyyy-MM-dd HH:mm:ss}; {bla.Item.Name}";
                            reportModel.ImagesNames.Add(new KeyValuePair<string, string>(label, imageField.UploadedData.FileName));
                        }
                    }

                    // posts
                    var casePostRequest = new CasePostsRequestCommonModel
                    {
                        Offset = 0,
                        PageSize = int.MaxValue,
                        TemplateId = groupedCase.templateId,
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
                    foreach (var caseDto in groupedCase.cases.OrderBy(x => x.MicrotingSdkCaseDoneAt))
                    {
                        var item = new ReportEformItemModel
                        {
                            Id = caseDto.Id,
                            MicrotingSdkCaseDoneAt = caseDto.MicrotingSdkCaseDoneAt,
                            DoneBy = caseDto.DoneByUserName,
                            ItemName = caseDto.Item.Name,
                            ItemDescription = caseDto.Item.Description,
                        };


                        var caseFields = await core.Advanced_FieldValueReadList(
                            new List<int>()
                            {
                                caseDto.MicrotingSdkCaseId
                            });

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
                                        item.CaseFields.Add(caseField.ValueReadable);
                                        break;
                                    default:
                                        item.CaseFields.Add(caseField.Value);
                                        break;
                                }
                            }
                        }

                        item.ImagesCount = await microtingDbContext.field_values
                            .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                            .Where(x => x.Field.FieldTypeId == 5)
                            .Where(x => x.CaseId == caseDto.MicrotingSdkCaseId)
                            .Select(x => x.Id)
                            .CountAsync();

                        item.PostsCount = casePostListResult.Model.Entities
                            .Where(x => x.CaseId == caseDto.MicrotingSdkCaseId)
                            .Select(x => x.PostId)
                            .Count();

                        reportModel.Items.Add(item);
                    }

                    result.Add(reportModel);
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