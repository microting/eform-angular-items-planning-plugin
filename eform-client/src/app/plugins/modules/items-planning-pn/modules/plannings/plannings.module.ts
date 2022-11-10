import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {
  OwlDateTimeModule,
  OwlMomentDateTimeModule,
} from '@danielmoncada/angular-datetime-picker';
import {TranslateModule} from '@ngx-translate/core';
import {
  PlanningCasePageComponent,
  PlanningCreateComponent,
  PlanningEditComponent,
  PlanningsContainerComponent,
  PlanningAssignSitesModalComponent,
  PlanningDeleteComponent,
  PlanningFoldersModalComponent,
  PlanningMultipleDeleteComponent,
  PlanningsBulkImportModalComponent,
  PlanningsHeaderComponent,
  PlanningsTableComponent,
  PlanningTagsComponent,
  UploadedDataDeleteComponent,
  UploadedDataPdfComponent,
} from './components';
import {PlanningsRouting} from './plannings.routing';
import {EformSharedModule} from 'src/app/common/modules/eform-shared/eform-shared.module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MtxGridModule} from '@ng-matero/extensions/grid';
import {MDBBootstrapModule} from 'angular-bootstrap-md';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';
import {FileUploadModule} from 'ng2-file-upload';
import {EformCasesModule} from 'src/app/common/modules/eform-cases/eform-cases.module';
import {EformSharedTagsModule} from 'src/app/common/modules/eform-shared-tags/eform-shared-tags.module';
import {planningsPersistProvider} from './components/store';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MtxSelectModule} from '@ng-matero/extensions/select';
import {MatInputModule} from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MtxButtonModule} from '@ng-matero/extensions/button';
import {MtxProgressModule} from '@ng-matero/extensions/progress';

@NgModule({
  declarations: [
    PlanningCasePageComponent,
    PlanningCreateComponent,
    PlanningEditComponent,
    PlanningsContainerComponent,
    PlanningAssignSitesModalComponent,
    PlanningDeleteComponent,
    PlanningFoldersModalComponent,
    PlanningMultipleDeleteComponent,
    PlanningsBulkImportModalComponent,
    PlanningsHeaderComponent,
    PlanningsTableComponent,
    PlanningTagsComponent,
    UploadedDataDeleteComponent,
    UploadedDataPdfComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    OwlDateTimeModule,
    PlanningsRouting,
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
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MtxSelectModule,
    MatInputModule,
    MatChipsModule,
    MatDialogModule,
    MtxButtonModule,
    MtxProgressModule,
  ],
  providers: [planningsPersistProvider],
})
export class PlanningsModule {
}
