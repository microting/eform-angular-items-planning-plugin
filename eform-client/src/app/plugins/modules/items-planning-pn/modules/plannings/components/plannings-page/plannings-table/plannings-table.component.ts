import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { PlanningModel } from '../../../../../models';
import {Paged, PaginationModel, TableHeaderElementModel} from 'src/app/common/models';
import { ItemsPlanningPnClaims } from '../../../../../enums';
import { PlanningsStateService } from '../../store';
import { AuthStateService } from 'src/app/common/store';
import {Sort} from '@angular/material/sort';
import {MtxGridColumn} from '@ng-matero/extensions/grid';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-plannings-table',
  templateUrl: './plannings-table.component.html',
  styleUrls: ['./plannings-table.component.scss'],
})
export class PlanningsTableComponent implements OnInit {
  @Input() planningsModel: Paged<PlanningModel> = new Paged<PlanningModel>();
  @Input() selectedColCheckboxes = new Array<{planningId: number;}>();
  @Input() allPlanningCheckbox = false;
  @Output() sortTable: EventEmitter<string> = new EventEmitter<string>();
  @Output() tagSelected: EventEmitter<number> = new EventEmitter<number>();
  @Output() openAssignmentModal: EventEmitter<PlanningModel> = new EventEmitter<PlanningModel>();
  @Output() showDeletePlanningModal: EventEmitter<PlanningModel> = new EventEmitter<PlanningModel>();
  @Output() selectedPlanningsChanged: EventEmitter<Array<{planningId: number;}>> = new EventEmitter<Array<{planningId: number;}>>()
  @Output() paginationChanged: EventEmitter<PaginationModel> = new EventEmitter<PaginationModel>();

  tableHeaders: MtxGridColumn[] = [
    {header: this.translateService.stream('Id'), field: 'id', sortProp: {id: 'Id'}, sortable: true},
    {header: this.translateService.stream('TranslatedName'), field: 'translatedName', sortProp: {id: 'TranslatedName'}, sortable: true},
    {header: this.translateService.stream('Description'), field: 'description', sortProp: {id: 'Description'}, sortable: true},
    {header: this.translateService.stream('SdkFolderName'), field: 'folder.eFormSdkFolderName', sortProp: {id: 'SdkFolderName'}, sortable: true},
    {header: this.translateService.stream('RelatedEFormName'), field: 'planningRelatedEformName', sortProp: {id: 'RelatedEFormName'}, sortable: true},
    {header: this.translateService.stream('Tags'), field: 'tags'},
    {header: this.translateService.stream('RepeatEvery'), field: 'reiteration.repeatEvery', sortProp: {id: 'RepeatEvery'}, sortable: true},
    {
      header: this.translateService.stream('RepeatType'),
      field: 'reiteration.repeatType',
      sortProp: {id: 'RepeatType'},
      sortable: true,
      formatter: (rowData: PlanningModel) => {
        switch (rowData.reiteration.repeatType) {
          case 1: return this.translateService.instant('Day');
          case 2: return this.translateService.instant('Week');
          case 3: return this.translateService.instant('Month');
          default: return `--`;
        }
      }
    },
    {
      header: this.translateService.stream('DayOfWeek'),
      field: 'reiteration.dayOfWeek',
      sortProp: {id: 'DayOfWeek'},
      sortable: true,
      formatter: (rowData: PlanningModel) => {
        switch (rowData.reiteration.dayOfWeek) {
          case 1: return this.translateService.instant('Monday');
          case 2: return this.translateService.instant('Tuesday');
          case 3: return this.translateService.instant('Wednesday');
          case 4: return this.translateService.instant('Thursday');
          case 5: return this.translateService.instant('Friday');
          case 6: return this.translateService.instant('Saturday');
          case 7: return this.translateService.instant('Sunday');
          default: return `--`;
        }
      }
    },
    {
      header: this.translateService.stream('LastExecutedTime'),
      field: 'lastExecutedTime',
      sortProp: {id: 'LastExecutedTime'},
      sortable: true,
      type: 'date',
      typeParameter: {format: 'dd.MM.y HH:mm:ss'},
    },
    {
      header: this.translateService.stream('NextExecutionTime'),
      field: 'nextExecutionTime',
      sortProp: {id: 'NextExecutionTime'},
      sortable: true,
      type: 'date',
      typeParameter: {format: 'dd.MM.y HH:mm:ss'},
    },
    {header: this.translateService.stream('PushMessageSent'), field: 'pushMessageSent', sortProp: {id: 'PushMessageSent'}, sortable: true},
    {
      header: this.translateService.stream('Actions'),
      field: 'actions',
      type: 'button',
      buttons: [
        {
          color: 'accent',
          type: 'icon',
          icon: 'link',
          tooltip: this.translateService.stream('Click to edit pairing with user(s)'),
          click: (rowData: PlanningModel) => this.onOpenAssignmentModal(rowData),
          iif: (rowData: PlanningModel) => rowData?.assignedSites?.length > 0
        },
        {
          type: 'icon',
          icon: 'link',
          tooltip: this.translateService.stream('Click to edit pairing with user(s)'),
          click: (rowData: PlanningModel) => this.onOpenAssignmentModal(rowData),
          iif: (rowData: PlanningModel) => !(rowData?.assignedSites?.length > 0)
        },
        {
          type: 'icon',
          icon: 'edit',
          tooltip: this.translateService.stream('Edit Planning'),
          iif: (rowData: PlanningModel) =>
            this.authStateService.checkClaim(ItemsPlanningPnClaims.editPlanning) && rowData.isLocked || !rowData.isEditable,
          click: (rowData: PlanningModel) => this.router.navigate(['./edit/' + rowData.id]),
        },
        {
          color: 'warn',
          type: 'icon',
          icon: 'delete',
          tooltip: this.translateService.stream('Delete Planning'),
          click: (rowData: PlanningModel) => this.onShowDeletePlanningModal(rowData),
          iif: (rowData: PlanningModel) => rowData.isLocked
        },
      ]
    },
  ];

  get itemsPlanningPnClaims() {
    return ItemsPlanningPnClaims;
  }

  get getSelectedPlannings() {
    return this.planningsModel.entities.filter(x => this.selectedColCheckboxes.some(y => y.planningId === x.id));
  }

  constructor(
    public planningsStateService: PlanningsStateService,
    public authStateService: AuthStateService,
    private translateService: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSortTable(sort: Sort) {
    this.sortTable.emit(sort.active);
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

  onPaginationChanged(paginationModel: PaginationModel) {
    this.paginationChanged.emit(paginationModel)
  }

  updateSelectedPlannings(planningModels: PlanningModel[]) {
    this.selectedColCheckboxes = planningModels.map(x => ({planningId: x.id}));
    this.selectedPlanningsChanged.emit(this.selectedColCheckboxes);
  }
}
