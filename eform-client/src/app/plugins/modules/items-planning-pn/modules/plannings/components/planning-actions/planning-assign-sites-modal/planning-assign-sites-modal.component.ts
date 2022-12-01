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
    { header: this.translateService.stream('Microting ID'), field: 'siteUId', },
    { header: this.translateService.stream('Device user'), field: 'siteName', },
  ];

  pairSingle$: Subscription;
  // getAllSites$: Subscription;

  get userClaims() {
    return this.authStateService.currentUserClaims;
  }

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
    this.sitesDto = model.sitesDto;
    this.selectedPlanning = model.selectedPlanning;
  }

  ngOnInit() {
    this.assignModel = new PlanningAssignSitesModel();
    this.rowSelected = this.sitesDto.filter(siteDto => this.selectedPlanning.assignedSites.some(x => x.siteId === siteDto.id));
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
