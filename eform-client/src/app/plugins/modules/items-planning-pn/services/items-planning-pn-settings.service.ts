import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationDataResult, OperationResult } from 'src/app/common/models';
import { ItemsPlanningBaseSettingsModel } from '../models/items-planning-base-settings.model';
import { ApiBaseService } from 'src/app/common/services';

export let ItemsPlanningSettingsMethods = {
  ItemsPlanningSettings: 'api/items-planning-pn/settings',
};
@Injectable()
export class ItemsPlanningPnSettingsService {
  private apiBaseService = inject(ApiBaseService);

  getAllSettings(): Observable<
    OperationDataResult<ItemsPlanningBaseSettingsModel>
  > {
    return this.apiBaseService.get(
      ItemsPlanningSettingsMethods.ItemsPlanningSettings
    );
  }
  updateSettings(
    model: ItemsPlanningBaseSettingsModel
  ): Observable<OperationResult> {
    return this.apiBaseService.post(
      ItemsPlanningSettingsMethods.ItemsPlanningSettings,
      model
    );
  }
}
