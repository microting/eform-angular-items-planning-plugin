import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';

import { Observable} from 'rxjs';
import {Router} from '@angular/router';
import {OperationDataResult, OperationResult} from 'src/app/common/models/operation.models';
import {BaseService} from 'src/app/common/services/base.service';

import {
  PlanningPnModel,
  PlanningsPnModel,
  PlanningUpdateModel,
  PlanningsRequestModel, PlanningCreateModel, PlanningUnitImportModel
} from '../models/plannings';

export let ItemsPlanningPnListsMethods = {
  Lists: 'api/items-planning-pn/lists',
};
@Injectable({
  providedIn: 'root'
})
export class ItemsPlanningPnPlanningsService extends BaseService {

  constructor(private _http: HttpClient, router: Router, toastrService: ToastrService) {
    super(_http, router, toastrService);
  }

  getAllPlannings(model: PlanningsRequestModel): Observable<OperationDataResult<PlanningsPnModel>> {
    return this.get(ItemsPlanningPnListsMethods.Lists, model);
  }

  getSinglePlanning(listId: number): Observable<OperationDataResult<PlanningPnModel>> {
    return this.get(ItemsPlanningPnListsMethods.Lists + '/' + listId);
  }

  updatePlanning(model: PlanningUpdateModel): Observable<OperationResult> {
    return this.put(ItemsPlanningPnListsMethods.Lists, model);
  }

  createList(model: PlanningCreateModel): Observable<OperationResult> {
    return this.post(ItemsPlanningPnListsMethods.Lists, model);
  }

  deletePlanning(fractionId: number): Observable<OperationResult> {
    return this.delete(ItemsPlanningPnListsMethods.Lists + '/' + fractionId);
  }

  importUnit(model: PlanningUnitImportModel): Observable<OperationResult> {
    return this.post(ItemsPlanningPnListsMethods.Lists + '/import', model);
  }
}
