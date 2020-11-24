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

namespace ItemsPlanning.Pn.Services.ExcelService
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using ClosedXML.Excel;
    using Infrastructure.Consts;
    using Infrastructure.Models.Import;
    using Microsoft.Extensions.Logging;

    public class PlanningExcelService : IPlanningExcelService
    {
        private readonly ILogger<PlanningExcelService> _logger;

        public PlanningExcelService(ILogger<PlanningExcelService> logger)
        {
            _logger = logger;
        }

        public List<PlanningImportExcelModel> ParsePlanningImportFile(Stream excelStream)
        {
            try
            {
                var result = new List<PlanningImportExcelModel>();
                var workbook = new XLWorkbook(excelStream);
                var worksheet = workbook.Worksheet(PlanningImportExcelConsts.EformsWorksheet);
                var rows = worksheet.RangeUsed()
                    .RowsUsed();

                foreach (var row in rows.Skip(1)) // Skip header
                {
                    // Folders
                    var folders = new List<PlanningImportFolderModel>();

                    // Folder 1
                    var folder1Label = row.Cell(PlanningImportExcelConsts.Folder1Label).Value.ToString();
                    var folder1Description = row.Cell(PlanningImportExcelConsts.Folder1Description).Value.ToString();

                    if (!string.IsNullOrEmpty(folder1Label))
                    {
                        var folderModel = new PlanningImportFolderModel
                        {
                            Label = folder1Label,
                            Description = folder1Description,
                            Level = 1,
                        };

                        folders.Add(folderModel);
                    }

                    // Folder 2
                    var folder2Label = row.Cell(PlanningImportExcelConsts.Folder2Label).Value.ToString();
                    var folder2Description = row.Cell(PlanningImportExcelConsts.Folder2Description).Value.ToString();

                    if (!string.IsNullOrEmpty(folder2Label))
                    {
                        var folderModel = new PlanningImportFolderModel
                        {
                            Label = folder2Label,
                            Description = folder2Description,
                            Level = 2,
                        };

                        folders.Add(folderModel);
                    }

                    // Folder 3
                    var folder3Label = row.Cell(PlanningImportExcelConsts.Folder3Label).Value.ToString();
                    var folder3Description = row.Cell(PlanningImportExcelConsts.Folder3Description).Value.ToString();

                    if (!string.IsNullOrEmpty(folder3Label))
                    {
                        var folderModel = new PlanningImportFolderModel
                        {
                            Label = folder3Label,
                            Description = folder3Description,
                            Level = 3,
                        };

                        folders.Add(folderModel);
                    }

                    // Folder 4
                    var folder4Label = row.Cell(PlanningImportExcelConsts.Folder4Label).Value.ToString();
                    var folder4Description = row.Cell(PlanningImportExcelConsts.Folder4Description).Value.ToString();

                    if (!string.IsNullOrEmpty(folder4Label))
                    {
                        var folderModel = new PlanningImportFolderModel
                        {
                            Label = folder4Label,
                            Description = folder4Description,
                            Level = 4,
                        };

                        folders.Add(folderModel);
                    }

                    // Folder 5
                    var folder5Label = row.Cell(PlanningImportExcelConsts.Folder5Label).Value.ToString();
                    var folder5Description = row.Cell(PlanningImportExcelConsts.Folder5Description).Value.ToString();

                    if (!string.IsNullOrEmpty(folder5Label))
                    {
                        var folderModel = new PlanningImportFolderModel
                        {
                            Label = folder5Label,
                            Description = folder5Description,
                            Level = 5,
                        };

                        folders.Add(folderModel);
                    }

                    // Folder 6
                    var folder6Label = row.Cell(PlanningImportExcelConsts.Folder6Label).Value.ToString();
                    var folder6Description = row.Cell(PlanningImportExcelConsts.Folder6Description).Value.ToString();

                    if (!string.IsNullOrEmpty(folder6Label))
                    {
                        var folderModel = new PlanningImportFolderModel
                        {
                            Label = folder6Label,
                            Description = folder6Description,
                            Level = 6,
                        };

                        folders.Add(folderModel);
                    }

                    // Folder 7
                    var folder7Label = row.Cell(PlanningImportExcelConsts.Folder7Label).Value.ToString();
                    var folder7Description = row.Cell(PlanningImportExcelConsts.Folder7Description).Value.ToString();

                    if (!string.IsNullOrEmpty(folder7Label))
                    {
                        var folderModel = new PlanningImportFolderModel
                        {
                            Label = folder7Label,
                            Description = folder7Description,
                            Level = 7,
                        };

                        folders.Add(folderModel);
                    }

                    // Folder 8
                    var folder8Label = row.Cell(PlanningImportExcelConsts.Folder8Label).Value.ToString();
                    var folder8Description = row.Cell(PlanningImportExcelConsts.Folder8Description).Value.ToString();

                    if (!string.IsNullOrEmpty(folder8Label))
                    {
                        var folderModel = new PlanningImportFolderModel
                        {
                            Label = folder8Label,
                            Description = folder8Description,
                            Level = 8,
                        };

                        folders.Add(folderModel);
                    }

                    // Folder 9
                    var folder9Label = row.Cell(PlanningImportExcelConsts.Folder9Label).Value.ToString();
                    var folder9Description = row.Cell(PlanningImportExcelConsts.Folder9Description).Value.ToString();

                    if (!string.IsNullOrEmpty(folder9Label))
                    {
                        var folderModel = new PlanningImportFolderModel
                        {
                            Label = folder9Label,
                            Description = folder9Description,
                            Level = 9,
                        };

                        folders.Add(folderModel);
                    }

                    // Folder 10
                    var folder10Label = row.Cell(PlanningImportExcelConsts.Folder10Label).Value.ToString();
                    var folder10Description = row.Cell(PlanningImportExcelConsts.Folder10Description).Value.ToString();

                    if (!string.IsNullOrEmpty(folder10Label))
                    {
                        var folderModel = new PlanningImportFolderModel
                        {
                            Label = folder10Label,
                            Description = folder10Description,
                            Level = 10,
                        };

                        folders.Add(folderModel);
                    }




                    var item = new PlanningImportExcelModel
                    {
                        Folders = folders,
                    };

                    result.Add(item);
                }

                return result;
            }
            catch (Exception e)
            {
                _logger.LogError(e, e.Message);
                throw;
            }
        }
    }
}