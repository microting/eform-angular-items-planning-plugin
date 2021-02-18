using ItemsPlanning.Pn.Infrastructure.Models;
using ItemsPlanning.Pn.Services.ItemsPlanningTagsService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microting.eFormApi.BasePn.Infrastructure.Models.API;
using Microting.eFormApi.BasePn.Infrastructure.Models.Common;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using ItemsPlanning.Pn.Infrastructure.Models.Planning;

namespace ItemsPlanning.Pn.Controllers
{
    [Authorize]
    public class ItemsPlanningTagsController : Controller
    {
        private readonly IItemsPlanningTagsService _itemsPlanningTagsService;

        public ItemsPlanningTagsController(IItemsPlanningTagsService itemsPlanningTagsService)
        {
            _itemsPlanningTagsService = itemsPlanningTagsService;
        }

        [HttpGet]
        [Route("api/items-planning-pn/tags")]
        public async Task<OperationDataResult<List<CommonDictionaryModel>>> GetItemsPlanningTags()
        {
            return await _itemsPlanningTagsService.GetItemsPlanningTags();
        }

        [HttpPost]
        [Route("api/items-planning-pn/tags")]
        public async Task<OperationResult> CreateItemsPlanningTag([FromBody] PlanningTagModel requestModel)
        {
            return await _itemsPlanningTagsService.CreateItemsPlanningTag(requestModel);
        }

        [HttpPut]
        [Route("api/items-planning-pn/tags")]
        public async Task<OperationResult> UpdateItemsPlanningTag([FromBody] PlanningTagModel requestModel)
        {
            return await _itemsPlanningTagsService.UpdateItemsPlanningTag(requestModel);
        }

        [HttpDelete]
        [Route("api/items-planning-pn/tags/{id}")]
        public async Task<OperationResult> DeleteItemsPlanningTag(int id)
        {
            return await _itemsPlanningTagsService.DeleteItemsPlanningTag(id);
        }
    }
}
