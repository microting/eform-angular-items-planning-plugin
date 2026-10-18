import {NgModule} from '@angular/core';
import {
  PairingGridPageComponent,
  PairingGridTableComponent,
  PairingGridUpdateComponent,
} from './components';
import {PairingRouting} from './pairing.routing';

@NgModule({
  imports: [
    PairingRouting,
    PairingGridPageComponent,
    PairingGridTableComponent,
    PairingGridUpdateComponent,
  ],
})
export class PairingModule {
}
