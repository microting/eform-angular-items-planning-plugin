using ItemsPlanning.Pn.Infrastructure.Models;
using ItemsPlanning.Pn.Services.ItemsPlanningLocalizationService;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microting.eFormApi.BasePn.Abstractions;
using Microting.eFormApi.BasePn.Infrastructure.Models.API;
using Microting.eFormApi.BasePn.Infrastructure.Models.Common;
using Microting.ItemsPlanningBase.Infrastructure.Data;
using Microting.ItemsPlanningBase.Infrastructure.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ItemsPlanning.Pn.Services.ItemsPlanningTagsService
{
    public class ItemsPlanningTagsService : IItemsPlanningTagsService
    {
        private readonly ILogger<ItemsPlanningTagsService> _logger;
        private readonly IItemsPlanningLocalizationService _itemsPlanningLocalizationService;
        private readonly ItemsPlanningPnDbContext _dbContext;
        private readonly IUserService _userService;

        public ItemsPlanningTagsService(
                IItemsPlanningLocalizationService itemsPlanningLocalizationService,
                ILogger<ItemsPlanningTagsService> logger,
                ItemsPlanningPnDbContext dbContext,
                IUserService userService
                )
        {
            _itemsPlanningLocalizationService = itemsPlanningLocalizationService;
            _logger = logger;
            _dbContext = dbContext;
            _userService = userService;
        }

        public async Task<OperationDataResult<List<CommonDictionaryModel>>> GetItemsPlanningTags()
        {
            try
            {
                var itemsPlanningTags = await _dbContext.PlanningTags
                                    .AsNoTracking()
                                    .Select(x => new CommonDictionaryModel
                                    {
                                        Id = x.Id,
                                        Name = x.Name
                                    }).ToListAsync();

                return new OperationDataResult<List<CommonDictionaryModel>>(
                    true,
                    itemsPlanningTags);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                _logger.LogError(e.Message);
                return new OperationDataResult<List<CommonDictionaryModel>>(
                    false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileObtainingItemsPlanningTags"));
            }
        }

        public async Task<OperationResult> CreateItemsPlanningTag(PlanningTagModel requestModel)
        {
            try
            {
                var itemsPlanningTag = new PlanningTag
                {
                    Name = requestModel.Name,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = _userService.UserId,
                    UpdatedByUserId = _userService.UserId,
                    UpdatedAt = DateTime.UtcNow,
                    Version = 1
                };

                await _dbContext.PlanningTags.AddAsync(itemsPlanningTag);
                await _dbContext.SaveChangesAsync();

                return new OperationResult(
                    true,
                    _itemsPlanningLocalizationService.GetString("ItemsPlanningTagCreatedSuccessfully"));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                _logger.LogError(e.Message);
                return new OperationResult(
                    false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileCreatingItemsPlanningTag"));
            }
        }

        public async Task<OperationResult> DeleteItemsPlanningTag(int id)
        {
            try
            {
                var itemsPlanningTag = await _dbContext.PlanningTags
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (itemsPlanningTag == null)
                {
                    return new OperationResult(
                        false,
                        _itemsPlanningLocalizationService.GetString("ItemsPlanningTagNotFound"));
                }

                var planningsTags = await _dbContext.PlanningsTags.Where(x => x.PlanningTagId == id).ToListAsync();

                _dbContext.RemoveRange(planningsTags);
                _dbContext.PlanningTags.Remove(itemsPlanningTag);
                await _dbContext.SaveChangesAsync();

                return new OperationResult(
                    true,
                    _itemsPlanningLocalizationService.GetString("ItemsPlanningTagRemovedSuccessfully"));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                _logger.LogError(e.Message);
                return new OperationResult(
                    false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileRemovingItemsPlanningTag"));
            }
        }

        public async Task<OperationResult> UpdateItemsPlanningTag(PlanningTagModel requestModel)
        {
            try
            {
                var itemsPlanningTag = await _dbContext.PlanningTags
                    .FirstOrDefaultAsync(x => x.Id == requestModel.Id);

                if (itemsPlanningTag == null)
                {
                    return new OperationResult(
                        false,
                        _itemsPlanningLocalizationService.GetString("ItemsPlanningTagNotFound"));
                }

                itemsPlanningTag.Name = requestModel.Name;
                itemsPlanningTag.UpdatedAt = DateTime.UtcNow;
                itemsPlanningTag.UpdatedByUserId = _userService.UserId;

                _dbContext.PlanningTags.Update(itemsPlanningTag);
                await _dbContext.SaveChangesAsync();

                return new OperationResult(true,
                    _itemsPlanningLocalizationService.GetString("ItemsPlanningTagUpdatedSuccessfully"));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                _logger.LogError(e.Message);
                return new OperationResult(false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileUpdatingItemsPlanningTag"));
            }
        }
    }
}
