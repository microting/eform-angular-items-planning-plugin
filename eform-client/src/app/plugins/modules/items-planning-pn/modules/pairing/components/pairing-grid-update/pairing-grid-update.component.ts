import {Component, EventEmitter, Inject, OnInit, inject} from '@angular/core';
import {PairingUpdateModel} from '../../../../models';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'app-pairing-grid-update',
    templateUrl: './pairing-grid-update.component.html',
    styleUrls: ['./pairing-grid-update.component.scss'],
    standalone: false
})
export class PairingGridUpdateComponent implements OnInit {
  public dialogRef = inject(MatDialogRef<PairingGridUpdateComponent>);
  private model = inject<PairingUpdateModel[]>(MAT_DIALOG_DATA);

  updatePairings: EventEmitter<void> = new EventEmitter<void>();
  pairingsForDeploy: PairingUpdateModel[] = [];
  pairingsForRetract: PairingUpdateModel[] = [];

  constructor() {
    this.pairingsForDeploy = this.model.filter(x => x.paired === true);
    this.pairingsForRetract = this.model.filter(x => x.paired === false);
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
