import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {
  OwlDateTimeModule,
} from '@danielmoncada/angular-datetime-picker';
import {TranslateModule} from '@ngx-translate/core';
import {
  PlanningCaseDeleteComponent,
  ReportContainerComponent,
  ReportHeaderComponent,
  ReportTableComponent,
} from './components';
import {ReportsRouting} from './reports.routing';
import {EformSharedModule} from 'src/app/common/modules/eform-shared/eform-shared.module';
import {MtxGridModule} from '@ng-matero/extensions/grid';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {EformCasesModule} from 'src/app/common/modules/eform-cases/eform-cases.module';
import {EformSharedTagsModule} from 'src/app/common/modules/eform-shared-tags/eform-shared-tags.module';
import {planningsReportPersistProvider} from './components/store';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MtxSelectModule} from '@ng-matero/extensions/select';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';

@NgModule({
  declarations: [
    ReportContainerComponent,
    ReportHeaderComponent,
    ReportTableComponent,
    PlanningCaseDeleteComponent,
  ],
    imports: [
      CommonModule,
      TranslateModule,
      RouterModule,
      OwlDateTimeModule,
      ReportsRouting,
      EformSharedModule,
      MtxGridModule,
      FormsModule,
      ReactiveFormsModule,
      EformCasesModule,
      EformSharedTagsModule,
      MatFormFieldModule,
      MtxSelectModule,
      MatIconModule,
      MatInputModule,
      MatButtonModule,
      MatExpansionModule,
      MatDialogModule,
      MatDatepickerModule,
    ],
  providers: [planningsReportPersistProvider],
})
export class ReportsModule {
}
