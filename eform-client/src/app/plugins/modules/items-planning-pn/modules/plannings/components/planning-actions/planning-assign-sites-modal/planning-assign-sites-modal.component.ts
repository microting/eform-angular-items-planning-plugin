import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SiteNameDto } from 'src/app/common/models';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import {
  PlanningAssignedSitesModel,
  PlanningAssignSitesModel,
  PlanningModel,
} from '../../../../../models';
import {
  ItemsPlanningPnPairingService,
  ItemsPlanningPnPlanningsService,
} from '../../../../../services';
import { Subscription } from 'rxjs';
import { AuthStateService } from 'src/app/common/store';
import {MtxGridColumn} from '@ng-matero/extensions/grid';
import {TranslateService} from '@ngx-translate/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';

@AutoUnsubscribe()
@Component({
  selector: 'app-planning-assign-sites-modal',
  templateUrl: './planning-assign-sites-modal.component.html',
  styleUrls: ['./planning-assign-sites-modal.component.scss'],
})
export class PlanningAssignSitesModalComponent implements OnInit, OnDestroy {
  sitesAssigned: EventEmitter<void> = new EventEmitter<void>();
  assignModel: PlanningAssignSitesModel = new PlanningAssignSitesModel();
  selectedPlanning: PlanningModel = new PlanningModel();
  rowSelected: SiteNameDto[] = [];
  sitesDto: SiteNameDto[] = [];
  tableHeaders: MtxGridColumn[] = [
    { header: this.translateService.stream('Microting ID'), field: 'id', },
    { header: this.translateService.stream('Device user'), field: 'siteName', },
    { header: this.translateService.stream('Select'), field: 'select', },
    { header: this.translateService.stream('Status'), field: 'status', },
  ];

  pairSingle$: Subscription;
  // getAllSites$: Subscription;

  constructor(
    // private eFormService: EFormService,
    // private sitesService: SitesService,
    private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService,
    private itemsPlanningPnPairingService: ItemsPlanningPnPairingService,
    private authStateService: AuthStateService,
    public translateService: TranslateService,
    public dialogRef: MatDialogRef<PlanningAssignSitesModalComponent>,
    @Inject(MAT_DIALOG_DATA) model: {sitesDto: SiteNameDto[], selectedPlanning: PlanningModel}
  ) {
    // debugger;
    this.sitesDto = model.sitesDto;
    this.selectedPlanning = model.selectedPlanning;
  }

  ngOnInit() {
    this.assignModel = new PlanningAssignSitesModel();
    this.rowSelected = this.sitesDto.filter(siteDto => this.selectedPlanning.assignedSites.some(x => x.siteId === siteDto.id));
  }

  getAssignmentBySiteId(siteId: number): boolean {
    const assignedSite = this.selectedPlanning.assignedSites.find(
      (x) => x.siteId === siteId
    );
    return !!assignedSite;
  }

  addToArray(checked: MatCheckboxChange, siteId: number) {
    const assignmentObject = new PlanningAssignedSitesModel();
    const site = this.sitesDto.find(
      (x) => x.id === siteId
    );
    if (checked.checked) {
      assignmentObject.siteId = site.id;
      assignmentObject.siteUId = site.siteUId;
      assignmentObject.name = site.siteName;
      this.selectedPlanning.assignedSites = [
        ...this.selectedPlanning.assignedSites,
        assignmentObject,
      ];
    } else {
      this.selectedPlanning.assignedSites = this.selectedPlanning.assignedSites.filter(
        (x) => x.siteId !== siteId
      );
    }
    this.rowSelected = this.sitesDto.filter(siteDto => this.selectedPlanning.assignedSites.some(x => x.siteId === siteDto.id));
  }

  getLatestCaseStatus(siteId: number) {
    const assignedSite = this.selectedPlanning.assignedSites.find(
      (x) => x.siteId === siteId
    );
    if (assignedSite) {
      if (assignedSite.status !== undefined) {
        return assignedSite.status;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  submitAssignment() {
    this.assignModel.assignments = this.rowSelected.map(x => ({siteId: x.id, isChecked: true}));
    this.assignModel.planningId = this.selectedPlanning.id;
    this.pairSingle$ = this.itemsPlanningPnPairingService
      .pairSingle(this.assignModel)
      .subscribe((operation) => {
        if (operation && operation.success) {
          this.assignModel = new PlanningAssignSitesModel();
          this.hide();
          this.sitesAssigned.emit();
        }
      });
  }

  hide() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {}
}
