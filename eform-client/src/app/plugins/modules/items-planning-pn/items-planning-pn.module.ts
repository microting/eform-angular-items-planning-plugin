import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {EformCasesModule} from 'src/app/common/modules/eform-cases/eform-cases.module';
import { ItemsPlanningPnLayoutComponent } from './layouts';
import { RouterModule } from '@angular/router';
import { ItemsPlanningPnRouting } from './items-planning-pn.routing';
import {
  ItemsPlanningPnPairingService,
  ItemsPlanningPnPlanningsService,
  ItemsPlanningPnSettingsService,
  ItemsPlanningPnTagsService,
  ItemsPlanningPnUploadedDataService,
} from './services';
import { FileUploadModule } from 'ng2-file-upload';
import { OwlDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { EformSharedModule } from 'src/app/common/modules/eform-shared/eform-shared.module';
import { EformSharedTagsModule } from 'src/app/common/modules/eform-shared-tags/eform-shared-tags.module';
import {StoreModule} from '@ngrx/store';
import * as parringReducer from './state/parring/parring.reducer';
import * as planningsReducer from './state/plannings/plannings.reducer';
import * as reportsReducer from './state/reports/reports.reducer';


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
    OwlDateTimeModule,
    EformCasesModule,
    EformSharedTagsModule,
    StoreModule.forFeature('itemsPlanningPn',{
      pairingsState: parringReducer.reducer,
      planningsState: planningsReducer.reducer,
      planningsReportState: reportsReducer.reducer,
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
export class ItemsPlanningPnModule {}
