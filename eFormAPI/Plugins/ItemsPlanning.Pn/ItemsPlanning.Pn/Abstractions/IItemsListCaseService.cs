using System.Threading.Tasks;
using ItemsPlanning.Pn.Infrastructure.Models;
using Microting.eFormApi.BasePn.Infrastructure.Models.API;

namespace ItemsPlanning.Pn.Abstractions
{
    public interface IItemsListCaseService
    {
        Task<OperationDataResult<ItemsListCasePnModel>> GetSingleList(ItemListCasesPnRequestModel requestModel);

        Task<OperationDataResult<ItemListPnCaseResultListModel>> GetSingleListResults(
            ItemListCasesPnRequestModel requestModel);
        Task<OperationDataResult<FileStreamModel>> GenerateSingleListResults(
            ItemListCasesPnRequestModel requestModel);
        Task<OperationDataResult<ItemsListPnItemCaseModel>> GetSingleCase(int caseId);
        Task<string> DownloadEFormPdf(int caseId, string token, string fileType);

    }
}