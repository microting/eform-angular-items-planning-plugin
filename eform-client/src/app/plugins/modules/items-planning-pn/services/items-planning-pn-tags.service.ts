import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CommonDictionaryModel,
  DeviceUserModel,
  OperationDataResult,
  OperationResult,
  SharedTagCreateModel,
  SharedTagModel,
  SharedTagMultipleCreateModel,
} from 'src/app/common/models';
import { ApiBaseService } from 'src/app/common/services';

export let ItemsPlanningTagsMethods = {
  Tags: 'api/items-planning-pn/tags',
  CreateBulkTags: 'api/items-planning-pn/tags/bulk'
};

@Injectable()
export class ItemsPlanningPnTagsService {
  constructor(private apiBaseService: ApiBaseService) {}

  getPlanningsTags(): Observable<OperationDataResult<SharedTagModel[]>> {
    return this.apiBaseService.get<SharedTagModel[]>(
      ItemsPlanningTagsMethods.Tags
    );
  }

  updatePlanningTag(model: SharedTagModel): Observable<OperationResult> {
    return this.apiBaseService.put(
      ItemsPlanningTagsMethods.Tags,
      model
    );
  }

  deletePlanningTag(id: number): Observable<OperationResult> {
    return this.apiBaseService.delete(ItemsPlanningTagsMethods.Tags + '/' + id);
  }

  createPlanningTag(model: SharedTagCreateModel): Observable<OperationResult> {
    return this.apiBaseService.post(
      ItemsPlanningTagsMethods.Tags,
      model
    );
  }

  createPlanningTags(model: SharedTagMultipleCreateModel): Observable<OperationResult> {
    return this.apiBaseService.post(
      ItemsPlanningTagsMethods.CreateBulkTags,
      model
    );
  }
}
