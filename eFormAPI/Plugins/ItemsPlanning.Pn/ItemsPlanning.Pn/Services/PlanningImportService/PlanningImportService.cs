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
    using System.Diagnostics;
    using System.IO;
    using System.Threading.Tasks;
    using ExcelService;
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

        public async Task<OperationResult> ImportPlannings(Stream excelStream)
        {
            try
            {
                var fileResult = _planningExcelService.ParsePlanningImportFile(excelStream);

                //

                return new OperationResult(
                    true,
                    _itemsPlanningLocalizationService.GetString(""));
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                return new OperationResult(false,
                    _itemsPlanningLocalizationService.GetString(""));
            }
        }
    }
}
