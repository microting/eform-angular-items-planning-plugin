import {NgModule} from '@angular/core';
import {ItemsPlanningPnLayoutComponent} from './layouts';
import {ItemsPlanningPnRouting} from './items-planning-pn.routing';
import {
  ItemsPlanningPnPairingService,
  ItemsPlanningPnPlanningsService,
  ItemsPlanningPnSettingsService,
  ItemsPlanningPnTagsService,
  ItemsPlanningPnUploadedDataService,
} from './services';
import {StoreModule} from '@ngrx/store';
import {
  pairingReducer,
  planningsReducer,
} from './state';


@NgModule({
  imports: [
    ItemsPlanningPnLayoutComponent,
    ItemsPlanningPnRouting,
    StoreModule.forFeature('itemsPlanningPn', {
      pairingsState: pairingReducer,
      planningsState: planningsReducer,
    })
  ],
  providers: [
    ItemsPlanningPnSettingsService,
    ItemsPlanningPnPlanningsService,
    ItemsPlanningPnUploadedDataService,
    ItemsPlanningPnTagsService,
    ItemsPlanningPnPairingService,
    // SharedPnService, // need for planning case components
  ],
})
export class ItemsPlanningPnModule {
}
