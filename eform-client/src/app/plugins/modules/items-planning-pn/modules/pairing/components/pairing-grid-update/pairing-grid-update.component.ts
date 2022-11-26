import {Component, EventEmitter, Inject, OnInit,} from '@angular/core';
import {PairingUpdateModel} from '../../../../models';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-pairing-grid-update',
  templateUrl: './pairing-grid-update.component.html',
  styleUrls: ['./pairing-grid-update.component.scss'],
})
export class PairingGridUpdateComponent implements OnInit {
  updatePairings: EventEmitter<void> = new EventEmitter<void>();
  pairingsForDeploy: PairingUpdateModel[] = [];
  pairingsForRetract: PairingUpdateModel[] = [];

  constructor(
    public dialogRef: MatDialogRef<PairingGridUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) model: PairingUpdateModel[],
  ) {
    this.pairingsForDeploy = model.filter(x => x.paired === true);
    this.pairingsForRetract = model.filter(x => x.paired === false);
  }

  ngOnInit() {
  }

  hide() {
    this.dialogRef.close();
  }

  update() {
    this.updatePairings.emit();
  }
}
