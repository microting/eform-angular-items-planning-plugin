using System.Threading.Tasks;
using ItemsPlanning.Pn.Infrastructure.Models.Report;
using ItemsPlanning.Pn.Infrastructure.Models;
using Microting.eFormApi.BasePn.Infrastructure.Models.API;

namespace ItemsPlanning.Pn.Abstractions
{
    public interface IItemsPlanningReportService
    {
        Task<OperationDataResult<ReportModel>> GenerateReport(GenerateReportModel model);
        Task<OperationDataResult<FileStreamModel>> GenerateReportFile(GenerateReportModel model);
    }
}
