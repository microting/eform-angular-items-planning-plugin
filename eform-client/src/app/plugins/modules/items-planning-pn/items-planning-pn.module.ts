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
  ItemsPlanningPnCasesService,
  ItemsPlanningPnPairingService,
  ItemsPlanningPnPlanningsService,
  ItemsPlanningPnReportsService,
  ItemsPlanningPnSettingsService,
  ItemsPlanningPnTagsService,
  ItemsPlanningPnUploadedDataService,
} from './services';
import { FileUploadModule } from 'ng2-file-upload';
import { OwlDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { EformSharedModule } from 'src/app/common/modules/eform-shared/eform-shared.module';
import { EformSharedTagsModule } from 'src/app/common/modules/eform-shared-tags/eform-shared-tags.module';

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
  ],
  declarations: [
    ItemsPlanningPnLayoutComponent,
  ],
  providers: [
    ItemsPlanningPnSettingsService,
    ItemsPlanningPnPlanningsService,
    ItemsPlanningPnReportsService,
    ItemsPlanningPnCasesService,
    ItemsPlanningPnUploadedDataService,
    ItemsPlanningPnTagsService,
    ItemsPlanningPnPairingService,
    // SharedPnService, // need for planning case components
  ],
})
export class ItemsPlanningPnModule {}
