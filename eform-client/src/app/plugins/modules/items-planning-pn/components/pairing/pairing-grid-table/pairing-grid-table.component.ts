import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PairingUpdateModel, PairingsModel } from '../../../models/pairings';

@Component({
  selector: 'app-pairing-grid-table',
  templateUrl: './pairing-grid-table.component.html',
  styleUrls: ['./pairing-grid-table.component.scss'],
})
export class PairingGridTableComponent implements OnInit {
  @Input() pairingsModel: PairingsModel;
  @Output() pairingChanged = new EventEmitter<PairingUpdateModel>();

  constructor() {}

  ngOnInit(): void {}

  checked(e: any, planningId: number, deviceUserId: number) {
    this.pairingChanged.emit({
      paired: e.target.checked,
      planningId,
      deviceUserId,
    });
  }
}
