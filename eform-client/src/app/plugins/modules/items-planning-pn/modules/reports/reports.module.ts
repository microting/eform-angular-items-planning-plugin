import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {
  OwlDateTimeModule,
  OwlMomentDateTimeModule,
} from '@danielmoncada/angular-datetime-picker';
import {TranslateModule} from '@ngx-translate/core';
import {
  PlanningCaseDeleteComponent,
  ReportContainerComponent,
  ReportHeaderComponent,
  ReportImagesComponent,
  ReportPostsComponent,
  ReportTableComponent,
} from './components';
import {ReportsRouting} from './reports.routing';
import {EformSharedModule} from 'src/app/common/modules/eform-shared/eform-shared.module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MtxGridModule} from '@ng-matero/extensions/grid';
import {MDBBootstrapModule} from 'angular-bootstrap-md';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';
import {FileUploadModule} from 'ng2-file-upload';
import {EformCasesModule} from 'src/app/common/modules/eform-cases/eform-cases.module';
import {EformSharedTagsModule} from 'src/app/common/modules/eform-shared-tags/eform-shared-tags.module';
import {planningsReportPersistProvider} from './components/store';

@NgModule({
  declarations: [
    ReportContainerComponent,
    ReportHeaderComponent,
    ReportTableComponent,
    ReportPostsComponent,
    ReportImagesComponent,
    PlanningCaseDeleteComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    OwlDateTimeModule,
    ReportsRouting,
    OwlMomentDateTimeModule,
    EformSharedModule,
    FontAwesomeModule,
    MtxGridModule,
    MDBBootstrapModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    FileUploadModule,
    EformCasesModule,
    EformSharedTagsModule,
  ],
  providers: [planningsReportPersistProvider],
})
export class ReportsModule {
}
