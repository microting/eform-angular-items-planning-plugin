using System.Threading.Tasks;
using ItemsPlanning.Pn.Infrastructure.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microting.eFormApi.BasePn.Infrastructure.Models.API;
using Microting.ItemsPlanningBase.Infrastructure.Const;

namespace ItemsPlanning.Pn.Controllers
{
    using Services.Abstractions;

    [Authorize]
    public class PlanningController : Controller
    {        
        private readonly IPlanningService _planningService;

        public PlanningController(IPlanningService planningService)
        {
            _planningService = planningService;
        }

        [HttpGet]
        [Route("api/items-planning-pn/plannings")]
        public async Task<OperationDataResult<PlanningsPnModel>> Index(PlanningsRequestModel requestModel)
        {
            return await _planningService.Index(requestModel);
        }

        [HttpPost]
        [Route("api/items-planning-pn/plannings")]
        [Authorize(Policy = ItemsPlanningClaims.CreatePlannings)]
        public async Task<OperationResult> Create([FromBody] PlanningPnModel createModel)
        {
            return await _planningService.Create(createModel);
        }

        [HttpGet]
        [Route("api/items-planning-pn/plannings/{id}")]
        public async Task<OperationDataResult<PlanningPnModel>> Read(int id)
        {
            return await _planningService.Read(id);
        }

        [HttpPut]
        [Route("api/items-planning-pn/plannings")]
        public async Task<OperationResult> Update([FromBody] PlanningPnModel updateModel)
        {
            return await _planningService.Update(updateModel);
        }

        [HttpDelete]
        [Route("api/items-planning-pn/plannings/{id}")]
        public async Task<OperationResult> Delete(int id)
        {
            return await _planningService.Delete(id);
        }
        
        [HttpPost]
        [Route("api/items-planning-pn/plannings/import")]
        public async Task<OperationResult> ImportUnit([FromBody] UnitImportModel unitImportModel)
        {
            return await _planningService.ImportUnit(unitImportModel);
        }
    }
}