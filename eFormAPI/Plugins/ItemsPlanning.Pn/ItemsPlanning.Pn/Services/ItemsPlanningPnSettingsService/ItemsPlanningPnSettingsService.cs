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

namespace ItemsPlanning.Pn.Services.ItemsPlanningPnSettingsService;

using Infrastructure.Models.Settings;
using ItemsPlanningLocalizationService;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microting.eFormApi.BasePn.Infrastructure.Helpers.PluginDbOptions;
using Microting.eFormApi.BasePn.Infrastructure.Models.API;
using Microting.ItemsPlanningBase.Infrastructure.Data;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

public class ItemsPlanningPnSettingsService(
    ILogger<ItemsPlanningPnSettingsService> logger,
    IItemsPlanningLocalizationService itemsPlanningLocalizationService,
    ItemsPlanningPnDbContext dbContext,
    IPluginDbOptions<ItemsPlanningBaseSettings> options,
    IHttpContextAccessor httpContextAccessor)
    : IItemsPlanningPnSettingsService
{
#pragma warning disable CS1998
    public async Task<OperationDataResult<ItemsPlanningBaseSettings>> GetSettings()
#pragma warning restore CS1998
    {
        try
        {
            var option = options.Value;

            return new OperationDataResult<ItemsPlanningBaseSettings>(true, option);
        }
        catch (Exception e)
        {
            SentrySdk.CaptureException(e);
            logger.LogError(e.Message);
            logger.LogTrace(e.StackTrace);
            return new OperationDataResult<ItemsPlanningBaseSettings>(false,
                itemsPlanningLocalizationService.GetString("ErrorWhileObtainingItemsPlanningSettings"));
        }
    }

    public async Task<OperationResult> UpdateSettings(ItemsPlanningBaseSettings itemsPlanningBaseSettings)
    {
        try
        {
            await options.UpdateDb(settings =>
            {
                settings.StartTime = itemsPlanningBaseSettings.StartTime;
                settings.EndTime = itemsPlanningBaseSettings.EndTime;
                settings.ReportHeaderName = itemsPlanningBaseSettings.ReportHeaderName;
                settings.ReportSubHeaderName = itemsPlanningBaseSettings.ReportSubHeaderName;
                settings.ReportImageName = itemsPlanningBaseSettings.ReportImageName;
            }, dbContext, UserId);

            return new OperationResult(true,
                itemsPlanningLocalizationService.GetString("SettingsHaveBeenUpdatedSuccessfully"));
        }
        catch (Exception e)
        {
            SentrySdk.CaptureException(e);
            logger.LogError(e.Message);
            logger.LogTrace(e.StackTrace);
            return new OperationResult(false,
                itemsPlanningLocalizationService.GetString("ErrorWhileUpdatingSettings"));
        }
    }

    public int UserId
    {
        get
        {
            var value = httpContextAccessor?.HttpContext.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return value == null ? 0 : int.Parse(value);
        }
    }
}