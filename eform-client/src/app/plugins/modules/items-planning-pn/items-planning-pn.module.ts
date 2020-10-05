import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedPnModule } from '../shared/shared-pn.module';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ItemsPlanningPnLayoutComponent } from './layouts';
import {
  PlanningCreateComponent,
  PlanningCasePageComponent,
  PlanningDeleteComponent,
  PlanningEditComponent,
  PlanningsPageComponent,
  UploadedDataPdfComponent,
  UploadedDataDeleteComponent,
  PlanningAssignSitesModalComponent,
  PlanningFoldersModalComponent,
  PlanningTagsComponent,
} from './components/planning';
import { ItemsPlanningSettingsComponent } from './components/items-plannings-setting';
import { RouterModule } from '@angular/router';
import { ItemsPlanningPnRouting } from './items-planning-pn.routing.module';
import {
  ItemsPlanningPnPlanningsService,
  ItemsPlanningPnSettingsService,
  ItemsPlanningPnReportsService,
  ItemsPlanningPnCasesService,
  ItemsPlanningPnUploadedDataService,
  ItemsPlanningPnTagsService,
} from './services';
import {
  ReportContainerComponent,
  ReportHeaderComponent,
  ReportImagesComponent,
  ReportPostsComponent,
  ReportTableComponent,
} from './components/reports';
import { FileUploadModule } from 'ng2-file-upload';
import { OwlDateTimeModule } from 'ng-pick-datetime-ex';
import { EformSharedModule } from 'src/app/common/modules/eform-shared/eform-shared.module';
import { CasesModule } from 'src/app/modules';
import { EformSharedTagsModule } from 'src/app/common/modules/eform-shared-tags/eform-shared-tags.module';

@NgModule({
  imports: [
    CommonModule,
    SharedPnModule,
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
    PlanningsPageComponent,
    PlanningCreateComponent,
    PlanningCasePageComponent,
    PlanningEditComponent,
    PlanningDeleteComponent,
    PlanningAssignSitesModalComponent,
    PlanningFoldersModalComponent,
    PlanningTagsComponent,
    ItemsPlanningSettingsComponent,
    ReportContainerComponent,
    ReportHeaderComponent,
    ReportTableComponent,
    ReportPostsComponent,
    ReportImagesComponent,
    UploadedDataPdfComponent,
    UploadedDataDeleteComponent,
  ],
  providers: [
    ItemsPlanningPnSettingsService,
    ItemsPlanningPnPlanningsService,
    ItemsPlanningPnReportsService,
    ItemsPlanningPnCasesService,
    ItemsPlanningPnUploadedDataService,
    ItemsPlanningPnTagsService,
  ],
})
export class ItemsPlanningPnModule {}
