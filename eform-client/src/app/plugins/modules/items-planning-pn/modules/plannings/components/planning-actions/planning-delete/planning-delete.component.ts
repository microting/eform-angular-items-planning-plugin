import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {ItemsPlanningPnPlanningsService} from '../../../../../services';
import {PlanningModel} from '../../../../../models';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-planning-delete',
  templateUrl: './planning-delete.component.html',
  styleUrls: ['./planning-delete.component.scss']
})
export class PlanningDeleteComponent implements OnInit {
  planningDeleted: EventEmitter<void> = new EventEmitter<void>();
  constructor(
    private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService,
    public dialogRef: MatDialogRef<PlanningDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public planningModel: PlanningModel = new PlanningModel()
  ) { }

  ngOnInit() {
  }

  deletePlanning() {
    this.itemsPlanningPnPlanningsService.deletePlanning(this.planningModel.id).subscribe((data) => {
      if (data && data.success) {
        this.planningDeleted.emit();
        this.hide();
      }
    });
  }

  hide() {
    this.dialogRef.close();
  }
}
