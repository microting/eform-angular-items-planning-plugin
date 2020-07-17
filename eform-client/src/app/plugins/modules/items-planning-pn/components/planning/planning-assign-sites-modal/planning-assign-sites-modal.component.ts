import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {SiteNameDto} from 'src/app/common/models';
import {EFormService} from 'src/app/common/services/eform';
import {SitesService} from 'src/app/common/services/advanced';
import {AuthService} from 'src/app/common/services';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {PlanningAssignmentSiteModel, PlanningAssignSitesModel} from '../../../models/plannings/planning-assign-sites.model';
import {ItemsPlanningPnPlanningsService} from 'src/app/plugins/modules/items-planning-pn/services';
import {PlanningPnModel} from 'src/app/plugins/modules/items-planning-pn/models/plannings';

@AutoUnsubscribe()
@Component({
  selector: 'app-planning-assign-sites-modal',
  templateUrl: './planning-assign-sites-modal.component.html',
  styleUrls: ['./planning-assign-sites-modal.component.scss']
})
export class PlanningAssignSitesModalComponent implements OnInit {

  @ViewChild('frame', { static: true }) frame;
  @Output() sitesAssigned: EventEmitter<void> = new EventEmitter<void>();
  assignModel: PlanningAssignSitesModel = new PlanningAssignSitesModel();
  assignViewModel: PlanningAssignSitesModel = new PlanningAssignSitesModel();
  selectedPlanning: PlanningPnModel = new PlanningPnModel();
  sitesDto: Array<SiteNameDto> = [];
  matchFound = false;

  get userClaims() {
    return this.authService.userClaims;
  }

  constructor(private eFormService: EFormService,
              private sitesService: SitesService,
              private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.loadAllSites();
  }

  loadAllSites() {
    if (this.userClaims.eformsPairingRead) {
      this.sitesService.getAllSitesForPairing().subscribe(operation => {
        if (operation && operation.success) {
          this.sitesDto = operation.model;
          this.fillCheckboxes();
        }
      });
    }
  }

  show(planningModel: PlanningPnModel) {
    this.selectedPlanning = planningModel;
    this.assignModel = new PlanningAssignSitesModel();
    this.assignViewModel = new PlanningAssignSitesModel();
    this.frame.show();
  }

  addToArray(e: any, assignmentId: number) {
    const assignmentObject = new PlanningAssignmentSiteModel();
    assignmentObject.id = assignmentId;
    if (e.target.checked) {
      assignmentObject.isChecked = true;
      this.assignModel.assignments.push(assignmentObject);
    } else {
      this.assignModel.assignments = this.assignModel.assignments.filter(x => x.id !== assignmentId);
    }
  }

  fillCheckboxes() {
    for (const siteDto of this.sitesDto) {
      const deployObject = new PlanningAssignmentSiteModel();
      for (const assignedSite of this.selectedPlanning.assignedSites) {
        if (assignedSite.siteUId === siteDto.siteUId) {
          this.matchFound = true;
          deployObject.id = siteDto.siteUId;
          deployObject.isChecked = true;
          this.assignModel.assignments.push(deployObject);
        }
      }
      this.assignViewModel.planningId = this.selectedPlanning.id;
      deployObject.id = siteDto.siteUId;
      deployObject.isChecked = this.matchFound === true;
      this.matchFound = false;
      this.assignViewModel.assignments.push(deployObject);
    }
  }

  submitAssignment() {
    this.assignModel.planningId = this.selectedPlanning.id;
    this.itemsPlanningPnPlanningsService.assignPlanning(this.assignModel).subscribe(operation => {
      if (operation && operation.success) {
        this.assignModel = new PlanningAssignSitesModel();
        this.frame.hide();
        this.sitesAssigned.emit();
      }
    });
  }
}
