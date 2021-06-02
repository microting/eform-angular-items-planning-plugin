import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  OperationDataResult,
  OperationResult,
  Paged,
} from 'src/app/common/models';
import {
  PlanningCreateModel,
  PlanningModel,
  PlanningsRequestModel,
  PlanningUpdateModel,
} from '../models/plannings';
import { ApiBaseService } from 'src/app/common/services';

export let ItemsPlanningPnPlanningsMethods = {
  Plannings: 'api/items-planning-pn/plannings',
  PlanningsIndex: 'api/items-planning-pn/plannings/index',
  PlanningsImport: 'api/items-planning-pn/plannings/import',
  PlanningsAssign: 'api/items-planning-pn/plannings/assign-sites',
  PlanningsDeleteCase: 'api/items-planning-pn/plannings-case/delete',
  PlanningsDeleteMultiple: 'api/items-planning-pn/plannings/delete-multiple',
};

@Injectable({
  providedIn: 'root',
})
export class ItemsPlanningPnPlanningsService {
  constructor(private apiBaseService: ApiBaseService) {}

  getAllPlannings(
    model: PlanningsRequestModel
  ): Observable<OperationDataResult<Paged<PlanningModel>>> {
    return this.apiBaseService.post(
      ItemsPlanningPnPlanningsMethods.PlanningsIndex,
      model
    );
  }

  getSinglePlanning(
    planningId: number
  ): Observable<OperationDataResult<PlanningModel>> {
    return this.apiBaseService.get(ItemsPlanningPnPlanningsMethods.Plannings, {
      id: planningId,
    });
  }

  updatePlanning(model: PlanningUpdateModel): Observable<OperationResult> {
    return this.apiBaseService.put(
      ItemsPlanningPnPlanningsMethods.Plannings,
      model
    );
  }

  createPlanning(model: PlanningCreateModel): Observable<OperationResult> {
    return this.apiBaseService.post(
      ItemsPlanningPnPlanningsMethods.Plannings,
      model
    );
  }

  deletePlanning(planningId: number): Observable<OperationResult> {
    return this.apiBaseService.delete(
      ItemsPlanningPnPlanningsMethods.Plannings,
      { id: planningId }
    );
  }

  deletePlannings(planningsIds: number[]): Observable<OperationResult> {
    return this.apiBaseService.post(
      ItemsPlanningPnPlanningsMethods.PlanningsDeleteMultiple,
      planningsIds
    );
  }

  importPlanningsFromExcel(excelFile: File): Observable<OperationResult> {
    return this.apiBaseService.uploadFile(
      ItemsPlanningPnPlanningsMethods.PlanningsImport,
      excelFile
    );
  }

  deleteCasePlanning(planningCaseId: number): Observable<OperationResult> {
    return this.apiBaseService.delete(
      ItemsPlanningPnPlanningsMethods.PlanningsDeleteCase,
      { planningCaseId: planningCaseId }
    );
  }
}
