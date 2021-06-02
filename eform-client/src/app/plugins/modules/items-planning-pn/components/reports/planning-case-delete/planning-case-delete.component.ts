import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ItemsPlanningPnPlanningsService } from '../../../services';
import { ReportEformItemModel } from '../../../models';

@Component({
  selector: 'app-planning-case-delete',
  templateUrl: './planning-case-delete.component.html',
  styleUrls: ['./planning-case-delete.component.scss'],
})
export class PlanningCaseDeleteComponent implements OnInit {
  @ViewChild('frame', { static: false }) frame;
  @Output() planningCaseDeleted: EventEmitter<void> = new EventEmitter<void>();
  reportEformItemModel: ReportEformItemModel = new ReportEformItemModel();
  constructor(
    private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService
  ) {}

  ngOnInit() {}

  show(reportEformItemModel: ReportEformItemModel) {
    this.reportEformItemModel = reportEformItemModel;
    this.frame.show();
  }

  deletePlanning() {
    this.itemsPlanningPnPlanningsService
      .deleteCasePlanning(this.reportEformItemModel.id)
      .subscribe((data) => {
        if (data && data.success) {
          this.planningCaseDeleted.emit();
          this.frame.hide();
        }
      });
  }
}
