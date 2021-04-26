import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  OperationDataResult,
  OperationResult,
} from 'src/app/common/models/operation.models';
import { PlanningAssignSitesModel } from '../models/plannings/planning-assign-sites.model';
import { PairingsModel, PairingUpdateModel } from '../models/pairings';
import {ApiBaseService} from 'src/app/common/services';

export let ItemsPlanningPnPairingMethods = {
  Pairings: 'api/items-planning-pn/pairings',
  PairSingle: 'api/items-planning-pn/pairings/single',
};

@Injectable({
  providedIn: 'root',
})
export class ItemsPlanningPnPairingService {
  constructor(private apiBaseService: ApiBaseService) {}

  getAllPairings(model: {
    tagIds: number[];
  }): Observable<OperationDataResult<PairingsModel>> {
    return this.apiBaseService.post(ItemsPlanningPnPairingMethods.Pairings, model);
  }

  pairSingle(model: PlanningAssignSitesModel): Observable<OperationResult> {
    return this.apiBaseService.post(
      ItemsPlanningPnPairingMethods.PairSingle,
      model
    );
  }

  updatePairings(model: PairingUpdateModel[]): Observable<OperationResult> {
    return this.apiBaseService.put(ItemsPlanningPnPairingMethods.Pairings, model);
  }
}
