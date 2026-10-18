import {Component, EventEmitter, Inject, OnInit, inject} from '@angular/core';
import {MatDialogTitle, MatDialogActions} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'app-planning-multiple-delete',
    templateUrl: './planning-multiple-delete.component.html',
    styleUrls: ['./planning-multiple-delete.component.scss'],
    imports: [MatDialogTitle, MatDialogActions, TranslatePipe]
})
export class PlanningMultipleDeleteComponent implements OnInit {
  public dialogRef = inject(MatDialogRef<PlanningMultipleDeleteComponent>);
  public selectedPlanningsCount = inject<number>(MAT_DIALOG_DATA);

  deleteMultiplePlannings: EventEmitter<void> = new EventEmitter<void>();

  ngOnInit() {}

  hide() {
    this.dialogRef.close();
  }

  onDeleteMultiplePlannings() {
    this.deleteMultiplePlannings.emit();
  }
}
