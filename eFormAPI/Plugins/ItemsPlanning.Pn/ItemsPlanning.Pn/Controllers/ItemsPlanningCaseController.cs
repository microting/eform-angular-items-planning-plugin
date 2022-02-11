using System.Threading.Tasks;
using ItemsPlanning.Pn.Services.ItemsPlanningCaseService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microting.eFormApi.BasePn.Infrastructure.Models.Application.Case.CaseEdit;

namespace ItemsPlanning.Pn.Controllers;

[Authorize]
[Route("api/items-planning-pn")]
public class ItemsPlanningCaseController : Controller
{
    private readonly IItemsPlanningCaseService _itemsPlanningCaseService;

    public ItemsPlanningCaseController(IItemsPlanningCaseService itemsPlanningCaseService)
    {
        _itemsPlanningCaseService = itemsPlanningCaseService;
    }
    [HttpPut]
    [Route("cases")]
    public async Task<IActionResult> Update([FromBody] ReplyRequest model)
    {
        return Ok(await _itemsPlanningCaseService.Update(model));
    }
}