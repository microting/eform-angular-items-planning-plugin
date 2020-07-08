using System.Threading.Tasks;
using ItemsPlanning.Pn.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microting.eFormApi.BasePn.Infrastructure.Database.Entities;
using Microting.eFormApi.BasePn.Infrastructure.Models.API;

namespace ItemsPlanning.Pn.Controllers
{
    using Infrastructure.Models.Settings;

    public class ItemsPlanningSettingsController : Controller
    {
        private readonly IItemsPlanningPnSettingsService _itemsPlanningPnSettingsService;

        public ItemsPlanningSettingsController(IItemsPlanningPnSettingsService itemsPlanningPnSettingsService)
        {
            _itemsPlanningPnSettingsService = itemsPlanningPnSettingsService;
        }

        [HttpGet]
        [Authorize(Roles = EformRole.Admin)]
        [Route("api/items-planning-pn/settings")]
        public async Task<OperationDataResult<ItemsPlanningBaseSettings>> GetSettings()
        {
            return await _itemsPlanningPnSettingsService.GetSettings();
        }
        
        [HttpPost]
        [Authorize(Roles = EformRole.Admin)]
        [Route("api/items-planning-pn/settings")]
        public async Task<OperationResult> UpdateSettings([FromBody] ItemsPlanningBaseSettings itemsPlanningBaseSettings)
        {
            return await _itemsPlanningPnSettingsService.UpdateSettings(itemsPlanningBaseSettings);
        }

    }
}