import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { SiteNameDto } from 'src/app/common/models';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import {
  PlanningAssignmentSiteModel,
  PlanningAssignSitesModel,
  PlanningModel,
} from '../../../../../models';
import {
  ItemsPlanningPnPairingService,
  ItemsPlanningPnPlanningsService,
} from '../../../../../services';
import { Subscription } from 'rxjs';
import { AuthStateService } from 'src/app/common/store';

@AutoUnsubscribe()
@Component({
  selector: 'app-planning-assign-sites-modal',
  templateUrl: './planning-assign-sites-modal.component.html',
  styleUrls: ['./planning-assign-sites-modal.component.scss'],
})
export class PlanningAssignSitesModalComponent implements OnInit, OnDestroy {
  @Input() sitesDto: Array<SiteNameDto> = [];
  @ViewChild('frame', { static: true }) frame;
  @Output() sitesAssigned: EventEmitter<void> = new EventEmitter<void>();
  assignModel: PlanningAssignSitesModel = new PlanningAssignSitesModel();
  assignViewModel: PlanningAssignSitesModel = new PlanningAssignSitesModel();
  selectedPlanning: PlanningModel = new PlanningModel();
  pairSingle$: Subscription;
  // getAllSites$: Subscription;
  matchFound = false;

  get userClaims() {
    return this.authStateService.currentUserClaims;
  }

  constructor(
    // private eFormService: EFormService,
    // private sitesService: SitesService,
    private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService,
    private itemsPlanningPnPairingService: ItemsPlanningPnPairingService,
    private authStateService: AuthStateService
  ) {}

  ngOnInit() {}

  show(planningModel: PlanningModel) {
    this.selectedPlanning = planningModel;
    this.assignModel = new PlanningAssignSitesModel();
    this.fillCheckboxes();
    this.frame.show();
  }

  addToArray(e: any, assignmentId: number) {
    const assignmentObject = new PlanningAssignmentSiteModel();
    assignmentObject.siteId = assignmentId;
    if (e.target.checked) {
      assignmentObject.isChecked = true;
      this.assignModel.assignments.push(assignmentObject);
    } else {
      this.assignModel.assignments = this.assignModel.assignments.filter(
        (x) => x.siteId !== assignmentId
      );
    }
  }

  fillCheckboxes() {
    this.assignViewModel = new PlanningAssignSitesModel();
    for (const siteDto of this.sitesDto) {
      const deployObject = new PlanningAssignmentSiteModel();
      for (const assignedSite of this.selectedPlanning.assignedSites) {
        if (assignedSite.siteId === siteDto.id) {
          this.matchFound = true;
          deployObject.siteId = siteDto.id;
          deployObject.isChecked = true;
          this.assignModel.assignments.push(deployObject);
        }
      }
      this.assignViewModel.planningId = this.selectedPlanning.id;
      deployObject.siteId = siteDto.id;
      deployObject.isChecked = this.matchFound === true;
      this.matchFound = false;
      this.assignViewModel.assignments = [
        ...this.assignViewModel.assignments,
        deployObject,
      ];
    }
  }

  submitAssignment() {
    this.assignModel.planningId = this.selectedPlanning.id;
    this.pairSingle$ = this.itemsPlanningPnPairingService
      .pairSingle(this.assignModel)
      .subscribe((operation) => {
        if (operation && operation.success) {
          this.assignModel = new PlanningAssignSitesModel();
          this.frame.hide();
          this.sitesAssigned.emit();
        }
      });
  }

  hide() {
    this.frame.hide();
  }

  ngOnDestroy(): void {}
}
