import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  PlanningModel, PlanningsModel,
  PlanningsRequestModel,
} from '../../../../models/plannings';
import { PageSettingsModel } from 'src/app/common/models';
import { PluginClaimsHelper } from 'src/app/common/helpers';
import { ItemsPlanningPnClaims } from '../../../../enums';

@Component({
  selector: 'app-plannings-table',
  templateUrl: './plannings-table.component.html',
  styleUrls: ['./plannings-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningsTableComponent implements OnInit {
  @Input() localPageSettings: PageSettingsModel = new PageSettingsModel();
  @Input() planningsRequestModel: PlanningsRequestModel = new PlanningsRequestModel();
  @Input() planningsModel: PlanningsModel = new PlanningsModel();
  @Output() sortTable: EventEmitter<any> = new EventEmitter<any>();
  @Output() tagSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() openAssignmentModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() showDeletePlanningModal: EventEmitter<any> = new EventEmitter<any>();

  get pluginClaimsHelper() {
    return PluginClaimsHelper;
  }

  get itemsPlanningPnClaims() {
    return ItemsPlanningPnClaims;
  }

  constructor() {}

  ngOnInit(): void {}

  onSortTable(id: string) {}

  onTagSelected(id) {}

  onOpenAssignmentModal(planning: any) {}

  onShowDeletePlanningModal(planning: any) {}
}
