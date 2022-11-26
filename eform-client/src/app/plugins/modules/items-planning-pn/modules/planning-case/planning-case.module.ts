import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {GallerizeModule} from '@ngx-gallery/gallerize';
import {LightboxModule} from '@ngx-gallery/lightbox';
import {GalleryModule} from '@ngx-gallery/core';
import {FormsModule} from '@angular/forms';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {PlanningCaseRouting} from './planning-case.routing';
import {CasesModule} from 'src/app/modules';
import {EformImportedModule} from 'src/app/common/modules/eform-imported/eform-imported.module';
import {EformSharedModule} from 'src/app/common/modules/eform-shared/eform-shared.module';
import {PlanningCasePageComponent} from './planning-case-page/planning-case-page.component';
// import {PlanningCaseHeaderComponent} from './planning-case-header/planning-case-header.component';
import {EformCasesModule} from 'src/app/common/modules/eform-cases/eform-cases.module';
import {OwlDateTimeModule} from '@danielmoncada/angular-datetime-picker';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [
    // PlanningCaseHeaderComponent,
    PlanningCasePageComponent
  ],
  imports: [
    TranslateModule,
    EformSharedModule,
    PlanningCaseRouting,
    CommonModule,
    EformImportedModule,
    GallerizeModule,
    LightboxModule,
    GalleryModule,
    FormsModule,
    FontAwesomeModule,
    CasesModule,
    EformCasesModule,
    OwlDateTimeModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class PlanningCaseModule {
}
