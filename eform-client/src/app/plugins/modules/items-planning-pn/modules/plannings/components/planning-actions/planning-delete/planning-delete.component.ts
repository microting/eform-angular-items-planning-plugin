import {Component, EventEmitter, Inject, OnInit, inject} from '@angular/core';
import {ItemsPlanningPnPlanningsService} from '../../../../../services';
import {PlanningModel} from '../../../../../models';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'app-planning-delete',
    templateUrl: './planning-delete.component.html',
    styleUrls: ['./planning-delete.component.scss'],
    standalone: false
})
export class PlanningDeleteComponent implements OnInit {
  private itemsPlanningPnPlanningsService = inject(ItemsPlanningPnPlanningsService);
  public dialogRef = inject(MatDialogRef<PlanningDeleteComponent>);
  public planningModel = inject<PlanningModel>(MAT_DIALOG_DATA);

  planningDeleted: EventEmitter<void> = new EventEmitter<void>();

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
