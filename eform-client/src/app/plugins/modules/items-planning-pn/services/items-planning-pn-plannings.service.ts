import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import {
  OperationDataResult,
  OperationResult,
} from 'src/app/common/models/operation.models';

import {
  PlanningCreateModel,
  PlanningModel,
  PlanningsRequestModel,
  PlanningUpdateModel,
} from '../models/plannings';
import { Paged } from 'src/app/common/models';
import {ApiBaseService} from 'src/app/common/services';

export let ItemsPlanningPnPlanningsMethods = {
  Plannings: 'api/items-planning-pn/plannings',
  PlanningsAssign: 'api/items-planning-pn/plannings/assign-sites',
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
      ItemsPlanningPnPlanningsMethods.Plannings + '/index',
      model
    );
  }

  getSinglePlanning(
    planningId: number
  ): Observable<OperationDataResult<PlanningModel>> {
    return this.apiBaseService.get(
      ItemsPlanningPnPlanningsMethods.Plannings + '/' + planningId
    );
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

  deletePlanning(fractionId: number): Observable<OperationResult> {
    return this.apiBaseService.delete(
      ItemsPlanningPnPlanningsMethods.Plannings + '/' + fractionId
    );
  }

  deletePlannings(planningsIds: number[]): Observable<OperationResult> {
    return this.apiBaseService.post(
      ItemsPlanningPnPlanningsMethods.Plannings + '/delete-multiple',
      planningsIds
    );
  }

  importPlanningsFromExcel(excelFile: File): Observable<OperationResult> {
    return this.apiBaseService.uploadFile(
      ItemsPlanningPnPlanningsMethods.Plannings + '/import',
      excelFile
    );
  }
}
