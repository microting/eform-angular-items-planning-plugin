import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {
  OwlDateTimeModule,
  OwlMomentDateTimeModule,
} from '@danielmoncada/angular-datetime-picker';
import {TranslateModule} from '@ngx-translate/core';
import {
  PairingGridPageComponent,
  PairingGridTableComponent,
  PairingGridUpdateComponent,
} from './components';
import {PairingRouting} from './pairing.routing';
import {EformSharedModule} from 'src/app/common/modules/eform-shared/eform-shared.module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MtxGridModule} from '@ng-matero/extensions/grid';
import {MDBBootstrapModule} from 'angular-bootstrap-md';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';
import {FileUploadModule} from 'ng2-file-upload';
import {EformCasesModule} from 'src/app/common/modules/eform-cases/eform-cases.module';
import {EformSharedTagsModule} from 'src/app/common/modules/eform-shared-tags/eform-shared-tags.module';
import {pairingPersistProvider} from './components/store';

@NgModule({
  declarations: [
    PairingGridPageComponent,
    PairingGridTableComponent,
    PairingGridUpdateComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    OwlDateTimeModule,
    PairingRouting,
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
  providers: [pairingPersistProvider],
})
export class PairingModule {
}
