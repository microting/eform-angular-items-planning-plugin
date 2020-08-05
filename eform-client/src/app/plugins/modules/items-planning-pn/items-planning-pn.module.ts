import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedPnModule} from '../shared/shared-pn.module';
import {MDBBootstrapModule} from 'angular-bootstrap-md';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ItemsPlanningPnLayoutComponent} from './layouts';
import {
  PlanningCreateComponent,
  PlanningCasePageComponent,
  PlanningDeleteComponent,
  PlanningEditComponent,
  PlanningsPageComponent,
  UploadedDataPdfComponent,
  UploadedDataDeleteComponent, PlanningAssignSitesModalComponent,
} from './components/planning';
import {ItemsPlanningSettingsComponent} from './components/items-plannings-setting';
import {RouterModule} from '@angular/router';
import {ItemsPlanningPnRouting} from './items-planning-pn.routing.module';
import {ItemsPlanningPnPlanningsService,
  ItemsPlanningPnSettingsService,
  ItemsPlanningPnReportsService,
  ItemsPlanningPnCasesService,
  ItemsPlanningPnUploadedDataService} from './services';
import {
  ReportContainerComponent,
  ReportHeaderComponent, ReportImagesComponent, ReportPostsComponent,
  ReportTableComponent
} from './components/reports';
import {FileUploadModule} from 'ng2-file-upload';
import {OwlDateTimeModule} from 'ng-pick-datetime-ex';
import {EformSharedModule} from 'src/app/common/modules/eform-shared/eform-shared.module';

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
    OwlDateTimeModule
  ],
  declarations: [
    ItemsPlanningPnLayoutComponent,
    PlanningsPageComponent,
    PlanningCreateComponent,
    PlanningCasePageComponent,
    PlanningEditComponent,
    PlanningDeleteComponent,
    PlanningAssignSitesModalComponent,
    ItemsPlanningSettingsComponent,
    ReportContainerComponent,
    ReportHeaderComponent,
    ReportTableComponent,
    ReportPostsComponent,
    ReportImagesComponent,
    UploadedDataPdfComponent,
    UploadedDataDeleteComponent
  ],
  providers: [
    ItemsPlanningPnSettingsService,
    ItemsPlanningPnPlanningsService,
    ItemsPlanningPnReportsService,
    ItemsPlanningPnCasesService,
    ItemsPlanningPnUploadedDataService
  ]
})

export class ItemsPlanningPnModule { }
