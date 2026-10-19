import {NgModule} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {
  PairingGridPageComponent,
  PairingGridTableComponent,
  PairingGridUpdateComponent,
} from './components';
import {PairingRouting} from './pairing.routing';

@NgModule({
  imports: [
    MatDialogModule,
    PairingRouting,
    PairingGridPageComponent,
    PairingGridTableComponent,
    PairingGridUpdateComponent,
  ],
})
export class PairingModule {
}
