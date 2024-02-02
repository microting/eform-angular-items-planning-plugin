import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {
  PairingGridPageComponent,
  PairingGridTableComponent,
  PairingGridUpdateComponent,
} from './components';
import {PairingRouting} from './pairing.routing';
import {EformSharedModule} from 'src/app/common/modules/eform-shared/eform-shared.module';
import {MtxGridModule} from '@ng-matero/extensions/grid';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {EformCasesModule} from 'src/app/common/modules/eform-cases/eform-cases.module';
import {EformSharedTagsModule} from 'src/app/common/modules/eform-shared-tags/eform-shared-tags.module';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MtxSelectModule} from '@ng-matero/extensions/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';

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
        PairingRouting,
        EformSharedModule,
        MtxGridModule,
        FormsModule,
        ReactiveFormsModule,
        EformCasesModule,
        EformSharedTagsModule,
        MatButtonModule,
        MatTooltipModule,
        MatFormFieldModule,
        MtxSelectModule,
        MatCheckboxModule,
        MatDialogModule,
    ],
})
export class PairingModule {
}
