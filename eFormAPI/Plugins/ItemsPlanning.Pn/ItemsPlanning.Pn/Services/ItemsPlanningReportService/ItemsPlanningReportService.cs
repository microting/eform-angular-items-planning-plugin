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
    using Microting.eFormApi.BasePn.Abstractions;
    using Microting.eFormApi.BasePn.Infrastructure.Models.API;
    using Microting.eFormApi.BasePn.Infrastructure.Models.Application.CasePosts;
    using WordService;

    public class ItemsPlanningReportService : IItemsPlanningReportService
    {
        private readonly ILogger<ItemsPlanningReportService> _logger;
        private readonly IItemsPlanningLocalizationService _itemsPlanningLocalizationService;
        private readonly IWordService _wordService;
        private readonly IEFormCoreService _coreHelper;
        private readonly ICasePostBaseService _casePostBaseService;

        // ReSharper disable once SuggestBaseTypeForParameter
        public ItemsPlanningReportService(
            IItemsPlanningLocalizationService itemsPlanningLocalizationService,
            ILogger<ItemsPlanningReportService> logger,
            IEFormCoreService coreHelper,
            IWordService wordService,
            ICasePostBaseService casePostBaseService)
        {
            _itemsPlanningLocalizationService = itemsPlanningLocalizationService;
            _logger = logger;
            _coreHelper = coreHelper;
            _wordService = wordService;
            _casePostBaseService = casePostBaseService;
        }

        public async Task<OperationDataResult<List<ReportEformModel>>> GenerateReport(GenerateReportModel model)
        {
            try
            {
                Debugger.Break();
                var core = await _coreHelper.GetCore();
                await using var microtingDbContext = core.dbContextHelper.GetDbContext();
                var casesQuery = microtingDbContext.cases
                    .Include(x => x.Site)
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

                var itemCases = await casesQuery.ToListAsync();

                var groupedCases = itemCases
                    .Where(x => x.CheckListId != null)
                    .GroupBy(x => x.CheckListId)
                    .Select(x => new
                    {
                        templateId = (int)x.Key,
                        cases = x.ToList(),
                    })
                    .ToList();

                var result = new List<ReportEformModel>();
                foreach (var groupedCase in groupedCases)
                {
                    var template = await core.TemplateRead(groupedCase.templateId);
                    var fields =
                        await core.Advanced_TemplateFieldReadAll(groupedCase.templateId); // .label = headers[]

                    // Posts - check mailing in main app
                    var reportModel = new ReportEformModel
                    {
                        Name = template.Label,
                    };

                    // add headers
                    foreach (var fieldDto in fields)
                    {
                        reportModel.ItemHeaders.Add(fieldDto.Label);
                    }

                    // images
                    var templateCaseIds = groupedCase.cases.Select(x => (int?)x.Id).ToArray();
                    var imagesForEform = await microtingDbContext.field_values
                        .Where(x => x.Field.FieldTypeId == 5)
                        .Where(x => templateCaseIds.Contains(x.CaseId))
                        .ToListAsync();

                    // TODO reportModel.ImagesNames.AddRange();

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
                            _itemsPlanningLocalizationService.GetString(""));
                    }

                    foreach (var casePostCommonModel in casePostListResult.Model.Entities)
                    {
                        reportModel.Posts.Add(new ReportEformPostModel
                        {
                            CaseId = casePostCommonModel.Id,
                            Comment = casePostCommonModel.Text,
                            SentTo = casePostCommonModel.ToRecipients,
                        });
                    }

                    // add cases
                    foreach (var caseDto in groupedCase.cases)
                    {
                        var item = new ReportEformItemModel
                        {
                            Id = caseDto.Id,
                            CreatedAt = caseDto.CreatedAt,
                            DoneBy = caseDto.Site.Name,
                        };

                        item.CaseFields.Add(caseDto.FieldValue1);
                        item.CaseFields.Add(caseDto.FieldValue2);
                        item.CaseFields.Add(caseDto.FieldValue3);
                        item.CaseFields.Add(caseDto.FieldValue4);
                        item.CaseFields.Add(caseDto.FieldValue5);
                        item.CaseFields.Add(caseDto.FieldValue6);
                        item.CaseFields.Add(caseDto.FieldValue7);
                        item.CaseFields.Add(caseDto.FieldValue8);
                        item.CaseFields.Add(caseDto.FieldValue9);
                        item.CaseFields.Add(caseDto.FieldValue10);

                        item.ImagesCount = await microtingDbContext.field_values
                            .Where(x => x.Field.FieldTypeId == 5)
                            .Where(x => x.CaseId == caseDto.Id)
                            .Select(x => x.Id)
                            .FirstOrDefaultAsync();

                        item.PostsCount = casePostListResult.Model.Entities
                            .Where(x => x.Id == caseDto.Id)
                            .Select(x => x.Id)
                            .Count();
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