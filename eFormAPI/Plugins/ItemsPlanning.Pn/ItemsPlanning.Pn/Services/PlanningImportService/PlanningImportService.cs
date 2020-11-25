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
    using Microting.eFormApi.BasePn.Abstractions;
    using Microting.eFormApi.BasePn.Infrastructure.Models.API;
    using Microting.ItemsPlanningBase.Infrastructure.Data;

    public class PlanningImportService : IPlanningImportService
    {
        private readonly ItemsPlanningPnDbContext _dbContext;
        private readonly IItemsPlanningLocalizationService _itemsPlanningLocalizationService;
        private readonly IEFormCoreService _coreService;
        private readonly IUserService _userService;
        private readonly IPlanningExcelService _planningExcelService;

        public PlanningImportService(
            ItemsPlanningPnDbContext dbContext,
            IItemsPlanningLocalizationService itemsPlanningLocalizationService,
            IEFormCoreService coreService,
            IUserService userService,
            IPlanningExcelService planningExcelService)
        {
            _dbContext = dbContext;
            _itemsPlanningLocalizationService = itemsPlanningLocalizationService;
            _coreService = coreService;
            _userService = userService;
            _planningExcelService = planningExcelService;
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
                                "Eform name is empty")
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
                                "Item name is empty")
                        };

                        excelErrors.Add(error);
                    }

                    if (!excelModel.Folders.Any())
                    {
                        var error = new ExcelParseErrorModel
                        {
                            Row = excelModel.ExcelRow,
                            Message = _itemsPlanningLocalizationService.GetString(
                                "Folder not found")
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
                                $"{excelModel.EFormName} eform not found")
                        };

                        excelErrors.Add(error);
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


                result.Message = "ok!";



                return new OperationDataResult<ExcelParseResult>(
                    true,
                    result);
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                return new OperationDataResult<ExcelParseResult>(false,
                    _itemsPlanningLocalizationService.GetString("error"));
            }
        }
    }
}
