/*
The MIT License (MIT)

Copyright (c) 2007 - 2020 Microting A/S

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

namespace ItemsPlanning.Pn.Services.PairingService
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Linq;
    using System.Threading.Tasks;
    using Infrastructure.Models;
    using Infrastructure.Models.Pairing;
    using ItemsPlanningLocalizationService;
    using Microsoft.EntityFrameworkCore;
    using Microting.eForm.Infrastructure.Constants;
    using Microting.eFormApi.BasePn.Abstractions;
    using Microting.eFormApi.BasePn.Infrastructure.Models.API;
    using Microting.eFormApi.BasePn.Infrastructure.Models.Common;
    using Microting.ItemsPlanningBase.Infrastructure.Data;
    using Microting.ItemsPlanningBase.Infrastructure.Data.Entities;

    public class PairingService : IPairingService
    {
        private readonly ItemsPlanningPnDbContext _dbContext;
        private readonly IItemsPlanningLocalizationService _itemsPlanningLocalizationService;
        private readonly IEFormCoreService _coreService;
        private readonly IUserService _userService;

        public PairingService(
            ItemsPlanningPnDbContext dbContext,
            IItemsPlanningLocalizationService itemsPlanningLocalizationService,
            IEFormCoreService coreService,
            IUserService userService)
        {
            _dbContext = dbContext;
            _itemsPlanningLocalizationService = itemsPlanningLocalizationService;
            _coreService = coreService;
            _userService = userService;
        }
        public async Task<OperationDataResult<PairingsModel>> GetAllPairings()
        {
            try
            {
                var core = await _coreService.GetCore();
                List<CommonDictionaryModel> deviceUsers;
                await using (var dbContext = core.dbContextHelper.GetDbContext())
                {
                    deviceUsers = await dbContext.sites
                        .AsNoTracking()
                        .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                        .Select(x => new CommonDictionaryModel
                        {
                            Id = x.Id,
                            Name = x.Name,
                        }).ToListAsync();
                }

                var pairing = await _dbContext.Plannings
                    .Select(x => new PairingModel
                    {
                        PlanningId = x.Id,
                        PlanningName = x.Name,
                        PairingValues = x.PlanningSites
                            .Where(y => y.WorkflowState != Constants.WorkflowStates.Removed)
                            .Select(y=> new PairingValueModel
                            {
                                DeviceUserId = y.SiteId,
                                Paired = true
                            }).ToList(),
                    }).ToListAsync();

                // Add users who is not paired
                foreach (var pairingModel in pairing)
                {
                    foreach (var deviceUser in deviceUsers)
                    {
                        if (pairingModel.PairingValues.All(x => x.DeviceUserId != deviceUser.Id))
                        {
                            var pairingValue = new PairingValueModel
                            {
                                DeviceUserId = (int)deviceUser.Id,
                                Paired = false,
                            };

                            pairingModel.PairingValues.Add(pairingValue);
                        }
                    }

                    pairingModel.PairingValues = pairingModel.PairingValues
                        .OrderBy(x => x.DeviceUserId)
                        .ToList();
                }

                // Build result
                var result = new PairingsModel();

                foreach (var deviceUser in deviceUsers)
                {
                    result.DeviceUsers.Add(deviceUser.Name);
                }

                result.Pairings = pairing;

                return new OperationDataResult<PairingsModel>(
                    true,
                    result);
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                return new OperationDataResult<PairingsModel>(false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileObtainingPlanningPairings"));
            }
        }

        public async Task<OperationResult> PairSingle(PlanningAssignSitesModel requestModel)
        {
            await using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var planning = await _dbContext.Plannings
                    .Include(x => x.PlanningSites)
                    .Where(x => x.Id == requestModel.PlanningId)
                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                    .FirstOrDefaultAsync();

                if (planning == null)
                {
                    await transaction.RollbackAsync();
                    return new OperationDataResult<PlanningsPnModel>(false,
                        _itemsPlanningLocalizationService.GetString("PlanningNotFound"));
                }

                // for remove
                var assignmentsRequestIds = requestModel.Assignments
                    .Select(x => x.SiteId)
                    .ToList();

                var forRemove = planning.PlanningSites
                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                    .Where(x => !assignmentsRequestIds.Contains(x.SiteId))
                    .ToList();

                foreach (var planningSite in forRemove)
                {
                    await planningSite.Delete(_dbContext);
                }

                // for create
                var assignmentsIds = planning.PlanningSites
                    .Where(x => x.WorkflowState != Constants.WorkflowStates.Removed)
                    .Select(x => x.SiteId)
                    .ToList();

                var assignmentsForCreate = requestModel.Assignments
                    .Where(x => !assignmentsIds.Contains(x.SiteId))
                    .Select(x => x.SiteId)
                    .ToList();

                foreach (var assignmentSiteId in assignmentsForCreate)
                {
                    var planningSite = new PlanningSite
                    {
                        CreatedByUserId = _userService.UserId,
                        UpdatedByUserId = _userService.UserId,
                        PlanningId = planning.Id,
                        SiteId = assignmentSiteId,
                    };

                    await planningSite.Create(_dbContext);
                }

                await transaction.CommitAsync();
                return new OperationResult(true,
                    _itemsPlanningLocalizationService.GetString("PairingUpdatedSuccessfully"));
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                await transaction.RollbackAsync();
                return new OperationDataResult<PlanningsPnModel>(false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileUpdatingItemsPlanning"));
            }
        }

        public async Task<OperationResult> UpdatePairings(List<PairingUpdateModel> updateModels)
        {
            await using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var plannings = await _dbContext.Plannings
                    .Where(y => y.WorkflowState != Constants.WorkflowStates.Removed)
                    .Select(x => new
                    {
                        PlanningId = x.Id,
                        Entities = x.PlanningSites
                            .Where(y => y.WorkflowState != Constants.WorkflowStates.Removed)
                            .ToList(),
                    })
                    .ToListAsync();

                var pairingModel = updateModels
                    .GroupBy(x => x.PlanningId)
                    .Select(x => new
                    {
                        PlanningId = x.Key,
                        Models = x.ToList(),
                    }).ToList();

                foreach (var pairing in pairingModel)
                {
                    var planning = plannings.FirstOrDefault(x => x.PlanningId == pairing.PlanningId);

                    if (planning != null)
                    {
                        // for remove
                        var sitesForRemoveIds = pairing.Models
                            .Where(x => !x.Paired)
                            .Select(x => x.DeviceUserId)
                            .ToList();

                        var forRemove = planning.Entities
                            .Where(x => sitesForRemoveIds.Contains(x.SiteId))
                            .ToList();

                        foreach (var site in forRemove)
                        {
                            await site.Delete(_dbContext);
                        }

                        // for create
                        var sitesForCreateIds = pairing.Models
                            .Where(x => x.Paired)
                            .Select(x => x.DeviceUserId)
                            .ToList();

                        var planningSitesIds = planning.Entities
                            .Select(x => x.SiteId)
                            .ToList();

                        var sitesForCreate = sitesForCreateIds
                            .Where(x => !planningSitesIds.Contains(x))
                            .ToList();

                        foreach (var assignmentSiteId in sitesForCreate)
                        {
                            var newPlanningSite = new PlanningSite
                            {
                                CreatedByUserId = _userService.UserId,
                                UpdatedByUserId = _userService.UserId,
                                PlanningId = pairing.PlanningId,
                                SiteId = assignmentSiteId,
                            };

                            await newPlanningSite.Create(_dbContext);
                        }
                    }
                }

                await transaction.CommitAsync();

                return new OperationResult(
                    true,
                    _itemsPlanningLocalizationService.GetString("PairingsUpdatedSuccessfully"));
            }
            catch (Exception e)
            {
                Trace.TraceError(e.Message);
                await transaction.RollbackAsync();
                return new OperationResult(false,
                    _itemsPlanningLocalizationService.GetString("ErrorWhileUpdatingItemsPlanning"));
            }
        }
    }
}