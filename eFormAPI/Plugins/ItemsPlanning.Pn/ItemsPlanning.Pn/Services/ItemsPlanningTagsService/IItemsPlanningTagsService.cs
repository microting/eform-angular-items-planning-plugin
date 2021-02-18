using ItemsPlanning.Pn.Infrastructure.Models;
using Microting.eFormApi.BasePn.Infrastructure.Models.API;
using Microting.eFormApi.BasePn.Infrastructure.Models.Common;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using ItemsPlanning.Pn.Infrastructure.Models.Planning;

namespace ItemsPlanning.Pn.Services.ItemsPlanningTagsService
{
    public interface IItemsPlanningTagsService
    {
        Task<OperationDataResult<List<CommonDictionaryModel>>> GetItemsPlanningTags();
        Task<OperationResult> UpdateItemsPlanningTag(PlanningTagModel requestModel);
        Task<OperationResult> DeleteItemsPlanningTag(int id);
        Task<OperationResult> CreateItemsPlanningTag(PlanningTagModel requestModel);
    }
}
