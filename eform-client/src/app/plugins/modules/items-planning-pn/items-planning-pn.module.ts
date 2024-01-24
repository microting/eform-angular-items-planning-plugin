import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';
import {EformCasesModule} from 'src/app/common/modules/eform-cases/eform-cases.module';
import {ItemsPlanningPnLayoutComponent} from './layouts';
import {RouterModule} from '@angular/router';
import {ItemsPlanningPnRouting} from './items-planning-pn.routing';
import {
  ItemsPlanningPnPairingService,
  ItemsPlanningPnPlanningsService,
  ItemsPlanningPnSettingsService,
  ItemsPlanningPnTagsService,
  ItemsPlanningPnUploadedDataService,
} from './services';
import {FileUploadModule} from 'ng2-file-upload';
import {EformSharedModule} from 'src/app/common/modules/eform-shared/eform-shared.module';
import {EformSharedTagsModule} from 'src/app/common/modules/eform-shared-tags/eform-shared-tags.module';
import {StoreModule} from '@ngrx/store';
import {
  pairingReducer,
  planningsReducer,
} from './state';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    NgSelectModule,
    EformSharedModule,
    RouterModule,
    ItemsPlanningPnRouting,
    ReactiveFormsModule,
    FileUploadModule,
    EformCasesModule,
    EformSharedTagsModule,
    StoreModule.forFeature('itemsPlanningPn', {
      pairingsState: pairingReducer,
      planningsState: planningsReducer,
    })
  ],
  declarations: [
    ItemsPlanningPnLayoutComponent,
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
