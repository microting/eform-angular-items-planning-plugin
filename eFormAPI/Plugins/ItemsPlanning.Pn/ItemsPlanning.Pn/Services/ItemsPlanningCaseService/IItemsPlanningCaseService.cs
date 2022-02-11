using System.Threading.Tasks;
using Microting.eFormApi.BasePn.Infrastructure.Models.API;
using Microting.eFormApi.BasePn.Infrastructure.Models.Application.Case.CaseEdit;

namespace ItemsPlanning.Pn.Services.ItemsPlanningCaseService;

public interface IItemsPlanningCaseService
{
    Task<OperationResult> Update(ReplyRequest model);
}