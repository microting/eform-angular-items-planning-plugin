import {Component, EventEmitter, Inject, OnInit,} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-planning-multiple-delete',
  templateUrl: './planning-multiple-delete.component.html',
  styleUrls: ['./planning-multiple-delete.component.scss'],
})
export class PlanningMultipleDeleteComponent implements OnInit {
  deleteMultiplePlannings: EventEmitter<void> = new EventEmitter<void>();
  constructor(
    public dialogRef: MatDialogRef<PlanningMultipleDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public selectedPlanningsCount: number,
  ) {}

  ngOnInit() {}

  hide() {
    this.dialogRef.close();
  }

  onDeleteMultiplePlannings() {
    this.deleteMultiplePlannings.emit();
  }
}
