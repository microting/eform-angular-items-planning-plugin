import {
  Component,
  EventEmitter,
  Inject,
  OnInit,
} from '@angular/core';
import {ItemsPlanningPnPlanningsService} from '../../../../services';
import {ReportEformItemModel} from '../../../../models';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-planning-case-delete',
  templateUrl: './planning-case-delete.component.html',
  styleUrls: ['./planning-case-delete.component.scss'],
})
export class PlanningCaseDeleteComponent implements OnInit {
  planningCaseDeleted: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService,
    public dialogRef: MatDialogRef<PlanningCaseDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public reportEformItemModel: ReportEformItemModel
  ) {
  }

  ngOnInit() {
  }

  hide(result = false) {
    this.dialogRef.close(result);
  }

  deletePlanning() {
    this.itemsPlanningPnPlanningsService
      .deleteCasePlanning(this.reportEformItemModel.id)
      .subscribe((data) => {
        if (data && data.success) {
          this.planningCaseDeleted.emit();
          this.hide(true);
        }
      });
  }
}
