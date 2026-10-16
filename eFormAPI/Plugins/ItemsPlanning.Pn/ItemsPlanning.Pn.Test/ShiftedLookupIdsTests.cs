/*
The MIT License (MIT)

Copyright (c) 2007 - 2026 Microting A/S

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

namespace ItemsPlanning.Pn.Test;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using eFormCore;
using ItemsPlanning.Pn.Infrastructure.Models.Import;
using ItemsPlanning.Pn.Infrastructure.Models.Report;
using ItemsPlanning.Pn.Services.ExcelService;
using ItemsPlanning.Pn.Services.ItemsPlanningLocalizationService;
using ItemsPlanning.Pn.Services.ItemsPlanningReportService;
using ItemsPlanning.Pn.Services.PlanningImportService;
using ItemsPlanning.Pn.Services.WordService;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Settings = Microting.eForm.Dto.Settings;
using Microting.eForm.Infrastructure;
using Microting.eForm.Infrastructure.Constants;
using Microting.eForm.Infrastructure.Data.Entities;
using Microting.eForm.Infrastructure.Helpers;
using UploadedData = Microting.eForm.Infrastructure.Data.Entities.UploadedData;
using Microting.eFormApi.BasePn.Abstractions;
using Microting.eFormApi.BasePn.Infrastructure.Models.API;
using Microting.eFormApi.BasePn.Infrastructure.Models.Application.CasePosts;
using Microting.ItemsPlanningBase.Infrastructure.Data;
using Microting.ItemsPlanningBase.Infrastructure.Data.Entities;
using Microting.ItemsPlanningBase.Infrastructure.Enums;
using NSubstitute;
using NUnit.Framework;
using Testcontainers.MariaDb;

/// <summary>
/// The SDK seeds its FieldTypes and Languages lookup tables through AUTO_INCREMENT, so
/// on a MariaDB Galera cluster (auto_increment_increment=3, offset=3) a fresh install
/// gets Text=3, Picture=15, Dansk=3, English=6 ... instead of the contiguous 1, 2, 3 of
/// older installs (eform-angular-frontend#8141). The server here is started with exactly
/// those settings and the SDK provisions itself, so any code that hard-codes a lookup id
/// misses the rows it is looking for.
/// </summary>
[TestFixture]
public class ShiftedLookupIdsTests
{
    private const string PluginDatabase = "items-planning-shifted-ids";

    private readonly MariaDbContainer _mariaDbContainer = new MariaDbBuilder("mariadb:11.2")
        .WithDatabase(PluginDatabase)
        .WithUsername("root")
        .WithPassword("secretpassword")
        .WithCommand("--auto-increment-increment=3", "--auto-increment-offset=3")
        .Build();

    private Core _core;
    private ItemsPlanningPnDbContext _dbContext;
    private int _danishLanguageId;

    [OneTimeSetUp]
    public async Task OneTimeSetUp()
    {
        await _mariaDbContainer.StartAsync();

        var pluginConnection = _mariaDbContainer.GetConnectionString();
        var sdkConnection = pluginConnection.Replace(PluginDatabase, "420_SDK");

        // The SqlController constructor migrates the SDK database and seeds FieldTypes,
        // Languages and default settings, exactly like a fresh production install.
        var sqlController = new SqlController(new DbContextHelper(sdkConnection));
        await sqlController.SettingUpdate(Settings.token, "abc1234567890abc1234567890abcdef");
        await sqlController.SettingUpdate(Settings.firstRunDone, "true");
        await sqlController.SettingUpdate(Settings.knownSitesDone, "true");
        await sqlController.SettingUpdate(Settings.comAddressNewApi, "none");

        _core = new Core();
        await _core.StartSqlOnly(sdkConnection);
        await using (var sdkDbContext = _core.DbContextHelper.GetDbContext())
        {
            _danishLanguageId = await sdkDbContext.Languages
                .Where(x => x.LanguageCode == "da")
                .Select(x => x.Id)
                .SingleAsync();
        }

        var options = new DbContextOptionsBuilder<ItemsPlanningPnDbContext>()
            .UseMySql(pluginConnection, ServerVersion.AutoDetect(pluginConnection))
            .Options;
        _dbContext = new ItemsPlanningPnDbContext(options);
        await _dbContext.Database.EnsureCreatedAsync();
    }

    [OneTimeTearDown]
    public async Task OneTimeTearDown()
    {
        if (_dbContext != null)
        {
            await _dbContext.DisposeAsync();
        }

        if (_core != null)
        {
            await _core.Close();
        }

        await _mariaDbContainer.DisposeAsync();
    }

    [Test]
    public async Task LookupTables_AreSeededWithShiftedIds()
    {
        // Guards the premise of the other tests: if the server ever stopped shifting
        // ids, they would pass for the wrong reason.
        await using var sdkDbContext = _core.DbContextHelper.GetDbContext();
        var picture = await sdkDbContext.FieldTypes.SingleAsync(x => x.Type == Constants.FieldTypes.Picture);

        Assert.That(picture.Id, Is.Not.EqualTo(5));
        Assert.That(_danishLanguageId, Is.Not.EqualTo(1));
    }

    [Test]
    public async Task GenerateReport_IncludesPictures_WhenPictureFieldTypeIdIsShifted()
    {
        var templateId = await CreatePictureTemplate();
        var (sdkCaseId, uploadedData) = await CreateCompletedCaseWithPicture(templateId);
        await CreatePlanningCase(templateId, sdkCaseId);

        var userService = Substitute.For<IUserService>();
        userService.GetCurrentUserTimeZoneInfo().Returns(TimeZoneInfo.Utc);
        userService.GetCurrentUserLocale().Returns("da");
        var casePostBaseService = Substitute.For<ICasePostBaseService>();
        casePostBaseService.GetCommonPosts(Arg.Any<CasePostsRequestCommonModel>())
            .Returns(new OperationDataResult<CasePostsCommonModel>(true, new CasePostsCommonModel()));

        var reportLogger = new ErrorRecordingLogger<ItemsPlanningReportService>();
        var service = new ItemsPlanningReportService(
            Substitute.For<IItemsPlanningLocalizationService>(),
            reportLogger,
            CoreServiceReturning(_core),
            Substitute.For<IWordService>(),
            Substitute.For<IPlanningExcelService>(),
            casePostBaseService,
            _dbContext,
            userService);

        var result = await service.GenerateReport(new GenerateReportModel
        {
            DateFrom = DateTime.UtcNow.AddDays(-1),
            DateTo = DateTime.UtcNow.AddDays(1),
            TagIds = new List<int>()
        }, false);

        Assert.That(result.Success, Is.True, string.Join(Environment.NewLine, reportLogger.Messages));
        var report = result.Model.Single(x => x.Items.Any(y => y.MicrotingSdkCaseId == sdkCaseId));
        Assert.That(report.ImageNames.SelectMany(x => x.Value), Does.Contain(uploadedData.FileName));
        Assert.That(report.Items.Single(x => x.MicrotingSdkCaseId == sdkCaseId).ImagesCount, Is.EqualTo(1));
    }

    [Test]
    public async Task ImportPlannings_StoresNameTranslationsPerLanguage_WhenLanguageIdsAreShifted()
    {
        var (danishName, _, _) = await ImportNewPlanning();

        Assert.That(await PlanningNamesByLanguageCode(danishName), Is.EquivalentTo(ExpectedNames(danishName)));
    }

    [Test]
    public async Task ImportPlannings_Reimport_KeepsOneNameTranslationPerLanguage_WhenLanguageIdsAreShifted()
    {
        // A re-import matches the existing planning and walks its translations by
        // language; with hard-coded language ids that walk threw or created duplicates.
        // (A re-import does not rename existing translations - that is existing
        // behaviour, not asserted here.)
        var (danishName, eFormName, folderLabel) = await ImportNewPlanning();

        await ImportPlanning(PlanningNameCell(danishName), eFormName, folderLabel);

        Assert.That(await PlanningNamesByLanguageCode(danishName), Is.EquivalentTo(ExpectedNames(danishName)));
    }

    private async Task<(string DanishName, string EFormName, string FolderLabel)> ImportNewPlanning()
    {
        var eFormName = await TemplateLabel(await CreatePictureTemplate());
        var danishName = $"Dansk navn {Guid.NewGuid():N}";
        var folderLabel = $"Folder {Guid.NewGuid():N}";
        await ImportPlanning(PlanningNameCell(danishName), eFormName, folderLabel);
        return (danishName, eFormName, folderLabel);
    }

    private static string PlanningNameCell(string danishName) => $"{danishName}|English name|Deutscher Name";

    private static Dictionary<string, string> ExpectedNames(string danishName) => new()
    {
        ["da"] = danishName,
        ["en-US"] = "English name",
        ["de-DE"] = "Deutscher Name"
    };

    private async Task ImportPlanning(string planningName, string eFormName, string folderLabel)
    {
        var excelService = Substitute.For<IPlanningExcelService>();
        excelService.ParsePlanningImportFile(Arg.Any<Stream>()).Returns(new List<PlanningImportExcelModel>
        {
            new()
            {
                ExcelRow = 2,
                PlanningName = planningName,
                EFormName = eFormName,
                Folders = new List<PlanningImportFolderModel>
                {
                    new() { Label = folderLabel, Description = "Folder description" }
                }
            }
        });
        var userService = Substitute.For<IUserService>();
        userService.GetCurrentUserTimeZoneInfo().Returns(TimeZoneInfo.Utc);
        var logger = new ErrorRecordingLogger<PlanningImportService>();

        var service = new PlanningImportService(
            _dbContext,
            Substitute.For<IItemsPlanningLocalizationService>(),
            CoreServiceReturning(_core),
            userService,
            excelService,
            logger);

        var result = await service.ImportPlannings(new MemoryStream());

        Assert.That(result.Success, Is.True, string.Join(Environment.NewLine, logger.Messages));
    }

    private async Task<Dictionary<string, string>> PlanningNamesByLanguageCode(string danishName)
    {
        await using var sdkDbContext = _core.DbContextHelper.GetDbContext();
        var languageCodes = await sdkDbContext.Languages.ToDictionaryAsync(x => x.Id, x => x.LanguageCode);
        var planningId = await _dbContext.PlanningNameTranslation
            .Where(x => x.Name == danishName)
            .Select(x => x.PlanningId)
            .SingleAsync();
        var translations = await _dbContext.PlanningNameTranslation
            .AsNoTracking()
            .Where(x => x.PlanningId == planningId)
            .ToListAsync();
        return translations.ToDictionary(x => languageCodes[x.LanguageId], x => x.Name);
    }

    private static IEFormCoreService CoreServiceReturning(Core core)
    {
        var coreService = Substitute.For<IEFormCoreService>();
        coreService.GetCore().Returns(core);
        return coreService;
    }

    private async Task<int> CreatePictureTemplate()
    {
        var xml = $@"<?xml version='1.0' encoding='utf-8'?>
<Main xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>
  <Id>1</Id>
  <Label>Picture eForm {Guid.NewGuid():N}</Label>
  <DisplayOrder>0</DisplayOrder>
  <CheckListFolderName>Folder</CheckListFolderName>
  <Repeated>1</Repeated>
  <StartDate>2018-08-23 10:40:52</StartDate>
  <EndDate>2058-08-29 10:40:52</EndDate>
  <Language>da</Language>
  <MultiApproval>false</MultiApproval>
  <FastNavigation>false</FastNavigation>
  <DownloadEntities>false</DownloadEntities>
  <ManualSync>false</ManualSync>
  <ElementList>
    <Element xsi:type='DataElement'>
      <Id>2</Id>
      <Label>Picture eForm</Label>
      <DisplayOrder>0</DisplayOrder>
      <Description><![CDATA[]]></Description>
      <ApprovalEnabled>false</ApprovalEnabled>
      <ReviewEnabled>false</ReviewEnabled>
      <DoneButtonEnabled>true</DoneButtonEnabled>
      <ExtraFieldsEnabled>false</ExtraFieldsEnabled>
      <PinkBarText />
      <DataItemGroupList />
      <DataItemList>
        <DataItem xsi:type='Picture'>
          <Id>3</Id>
          <Mandatory>false</Mandatory>
          <ReadOnly>false</ReadOnly>
          <Label>Photo</Label>
          <Description><![CDATA[]]></Description>
          <DisplayOrder>1</DisplayOrder>
        </DataItem>
      </DataItemList>
    </Element>
  </ElementList>
  <PushMessageTitle />
  <PushMessageBody />
</Main>";
        var mainElement = await _core.TemplateFromXml(xml);
        return await _core.TemplateCreate(mainElement);
    }

    private async Task<string> TemplateLabel(int templateId)
    {
        await using var sdkDbContext = _core.DbContextHelper.GetDbContext();
        return await sdkDbContext.CheckListTranslations
            .Where(x => x.CheckListId == templateId && x.LanguageId == _danishLanguageId)
            .Select(x => x.Text)
            .SingleAsync();
    }

    private async Task<(int CaseId, UploadedData UploadedData)> CreateCompletedCaseWithPicture(int templateId)
    {
        await using var sdkDbContext = _core.DbContextHelper.GetDbContext();
        var pictureField = await sdkDbContext.Fields
            .Where(x => x.CheckList.ParentId == templateId)
            .SingleAsync();

        var sdkCase = new Case
        {
            CheckListId = templateId,
            Status = 100,
            DoneAt = DateTime.UtcNow
        };
        await sdkCase.Create(sdkDbContext);

        var uploadedData = new UploadedData
        {
            FileName = $"{Guid.NewGuid():N}.jpg",
            Checksum = "checksum",
            Extension = ".jpg"
        };
        await uploadedData.Create(sdkDbContext);

        await new FieldValue
        {
            CaseId = sdkCase.Id,
            CheckListId = pictureField.CheckListId,
            FieldId = pictureField.Id,
            UploadedDataId = uploadedData.Id,
            DoneAt = DateTime.UtcNow
        }.Create(sdkDbContext);

        return (sdkCase.Id, uploadedData);
    }

    private async Task CreatePlanningCase(int templateId, int sdkCaseId)
    {
        var planning = new Planning
        {
            RelatedEFormId = templateId,
            RelatedEFormName = "Picture eForm",
            RepeatType = RepeatType.Month,
            RepeatEvery = 1,
            StartDate = DateTime.UtcNow
        };
        await planning.Create(_dbContext);
        await new PlanningNameTranslation
        {
            PlanningId = planning.Id,
            LanguageId = _danishLanguageId,
            Name = "Planning with picture"
        }.Create(_dbContext);
        await new PlanningCase
        {
            PlanningId = planning.Id,
            MicrotingSdkeFormId = templateId,
            MicrotingSdkCaseId = sdkCaseId,
            MicrotingSdkCaseDoneAt = DateTime.UtcNow,
            Status = 100
        }.Create(_dbContext);
    }
}

/// <summary>
/// The services under test swallow exceptions and only log them (message as Error, stack
/// trace as Trace), so the tests record both to explain a failed result.
/// </summary>
internal sealed class ErrorRecordingLogger<T> : ILogger<T>
{
    public List<string> Messages { get; } = new();

    public IDisposable BeginScope<TState>(TState state) where TState : notnull => null;

    public bool IsEnabled(LogLevel logLevel) => true;

    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception exception,
        Func<TState, Exception, string> formatter)
    {
        if (logLevel is >= LogLevel.Error or LogLevel.Trace)
        {
            Messages.Add(formatter(state, exception));
        }
    }
}
