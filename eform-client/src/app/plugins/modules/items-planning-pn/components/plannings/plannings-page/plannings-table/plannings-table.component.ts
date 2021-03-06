import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { PlanningModel } from '../../../../models/plannings';
import { Paged, TableHeaderElementModel } from 'src/app/common/models';
import { ItemsPlanningPnClaims } from '../../../../enums';
import { PlanningsStateService } from '../../store';
import { AuthStateService } from 'src/app/common/store';

@Component({
  selector: 'app-plannings-table',
  templateUrl: './plannings-table.component.html',
  styleUrls: ['./plannings-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningsTableComponent implements OnInit {
  @Input() planningsModel: Paged<PlanningModel> = new Paged<PlanningModel>();
  @Input() selectedColCheckboxes = new Array<{
    planningId: number;
    checked: boolean;
  }>();
  @Input() allPlanningCheckbox = false;
  @Output() sortTable: EventEmitter<string> = new EventEmitter<string>();
  @Output() tagSelected: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  openAssignmentModal: EventEmitter<PlanningModel> = new EventEmitter<PlanningModel>();
  @Output()
  showDeletePlanningModal: EventEmitter<PlanningModel> = new EventEmitter<PlanningModel>();
  @Output()
  singlePlanningCheckboxChanged: EventEmitter<{
    planningId: number;
    checked: boolean;
  }> = new EventEmitter<{ planningId: number; checked: boolean }>();
  @Output()
  allPlanningCheckboxChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  tableHeaders: TableHeaderElementModel[] = [
    { name: 'Id', elementId: 'idTableHeader', sortable: true },
    { name: 'TranslatedName', elementId: 'nameTableHeader', sortable: true },
    {
      name: 'Description',
      elementId: 'descriptionTableHeader',
      sortable: true,
    },
    {
      name: 'SdkFolderName',
      elementId: 'sdkFolderNameTableHeader',
      sortable: true,
    },
    {
      name: 'RelatedEFormName',
      elementId: 'relatedEFormNameTableHeader',
      sortable: true,
    },
    { name: 'Tags', elementId: 'tagsTableHeader', sortable: false },
    {
      name: 'RepeatEvery',
      elementId: 'repeatEveryTableHeader',
      sortable: true,
    },
    { name: 'RepeatType', elementId: 'repeatTypeTableHeader', sortable: true },
    // {
    //   name: 'RepeatUntil',
    //   elementId: 'repeatUntilTableHeader',
    //   sortable: true,
    // },
    {
      name: 'LastExecutedTime',
      elementId: 'lastExecutedTime',
      sortable: true,
    },
    {
      name: 'NextExecutionTime',
      elementId: 'nextExecutionTime',
      sortable: true,
    },
    {
      name: 'PushMessageSent',
      elementId: 'pushMessageSent',
      sortable: true,
    },
    { name: 'Actions', elementId: '', sortable: false },
  ];

  get itemsPlanningPnClaims() {
    return ItemsPlanningPnClaims;
  }

  constructor(
    public planningsStateService: PlanningsStateService,
    public authStateService: AuthStateService
  ) {}

  ngOnInit(): void {}

  onSortTable(sort: string) {
    this.sortTable.emit(sort);
  }

  onTagSelected(id: number) {
    this.tagSelected.emit(id);
  }

  onOpenAssignmentModal(planning: PlanningModel) {
    this.openAssignmentModal.emit(planning);
  }

  onShowDeletePlanningModal(planning: PlanningModel) {
    this.showDeletePlanningModal.emit(planning);
  }

  onSinglePlanningCheckboxChanged(e: any, planningId: number) {
    this.singlePlanningCheckboxChanged.emit({
      checked: e.target.checked,
      planningId,
    });
  }

  onAllPlanningsCheckboxChanged(e: any) {
    this.allPlanningCheckboxChanged.emit(e.target.checked);
  }

  getCheckedPlanning(id: number) {
    return (
      this.selectedColCheckboxes.findIndex((x) => x.planningId === id) > -1
    );
  }
}
