namespace ItemsPlanning.Pn.Services.Abstractions
{
    using System.Threading.Tasks;
    using Infrastructure.Models;
    using Microting.eFormApi.BasePn.Infrastructure.Models.API;

    public interface IPlanningCaseService
    {
        Task<OperationDataResult<PlanningCasesModel>> GetSinglePlanningCase(PlanningCasesPnRequestModel requestModel);

        Task<OperationDataResult<PlanningCaseResultListModel>> GetSingleCaseResults(
            PlanningCasesPnRequestModel requestModel);
        Task<OperationDataResult<FileStreamModel>> GenerateSingleCaseResults(
            PlanningCasesPnRequestModel requestModel);
        Task<OperationDataResult<PlanningItemCaseModel>> GetSingleCase(int caseId);
        Task<string> DownloadEFormPdf(int caseId, string token, string fileType);

    }
}