import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ItemsPlanningPnLayoutComponent } from './layouts';
import {
  ItemsPlanningSettingsComponent,
  PairingGridPageComponent,
  PairingGridTableComponent,
  PairingGridUpdateComponent,
  PlanningAssignSitesModalComponent,
  PlanningCasePageComponent,
  PlanningCreateComponent,
  PlanningDeleteComponent,
  PlanningEditComponent,
  PlanningFoldersModalComponent,
  PlanningMultipleDeleteComponent,
  PlanningsBulkImportModalComponent,
  PlanningsContainerComponent,
  PlanningsHeaderComponent,
  PlanningsTableComponent,
  PlanningTagsComponent,
  ReportContainerComponent,
  ReportHeaderComponent,
  ReportImagesComponent,
  ReportPostsComponent,
  ReportTableComponent,
  UploadedDataDeleteComponent,
  UploadedDataPdfComponent,
} from './components';
import { RouterModule } from '@angular/router';
import { ItemsPlanningPnRouting } from './items-planning-pn.routing.module';
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
import { CasesModule } from 'src/app/modules';
import { EformSharedTagsModule } from 'src/app/common/modules/eform-shared-tags/eform-shared-tags.module';
import { planningsStoreProviders } from './store-providers.config';

@NgModule({
  imports: [
    CommonModule,
    MDBBootstrapModule,
    TranslateModule,
    FormsModule,
    NgSelectModule,
    EformSharedModule,
    FontAwesomeModule,
    RouterModule,
    ItemsPlanningPnRouting,
    ReactiveFormsModule,
    FileUploadModule,
    OwlDateTimeModule,
    CasesModule,
    EformSharedTagsModule,
  ],
  declarations: [
    ItemsPlanningPnLayoutComponent,
    PlanningsContainerComponent,
    PlanningCreateComponent,
    PlanningCasePageComponent,
    PlanningEditComponent,
    PlanningDeleteComponent,
    PlanningAssignSitesModalComponent,
    PlanningFoldersModalComponent,
    PlanningTagsComponent,
    PlanningsBulkImportModalComponent,
    PairingGridPageComponent,
    PairingGridTableComponent,
    PairingGridUpdateComponent,
    ItemsPlanningSettingsComponent,
    ReportContainerComponent,
    ReportHeaderComponent,
    ReportTableComponent,
    ReportPostsComponent,
    ReportImagesComponent,
    UploadedDataPdfComponent,
    UploadedDataDeleteComponent,
    PlanningsHeaderComponent,
    PlanningsTableComponent,
    PlanningMultipleDeleteComponent,
  ],
  providers: [
    ItemsPlanningPnSettingsService,
    ItemsPlanningPnPlanningsService,
    ItemsPlanningPnReportsService,
    ItemsPlanningPnCasesService,
    ItemsPlanningPnUploadedDataService,
    ItemsPlanningPnTagsService,
    ItemsPlanningPnPairingService,
    ...planningsStoreProviders,
  ],
})
export class ItemsPlanningPnModule {}
