import {Component, OnInit, ViewChild} from '@angular/core';
import {PageSettingsModel} from 'src/app/common/models/settings';

import {SharedPnService} from 'src/app/plugins/modules/shared/services';
import {PlanningPnModel, PlanningsRequestModel, PlanningsPnModel} from '../../../models/plannings';
import {ItemsPlanningPnPlanningsService} from '../../../services';
import {PluginClaimsHelper} from 'src/app/common/helpers';
import {ItemsPlanningPnClaims} from '../../../enums';

@Component({
  selector: 'app-plannings-page',
  templateUrl: './plannings-page.component.html',
  styleUrls: ['./plannings-page.component.scss']
})
export class PlanningsPageComponent implements OnInit {
  @ViewChild('deletePlanningModal', {static: false}) deletePlanningModal;
  @ViewChild('modalCasesColumns', {static: false}) modalCasesColumnsModal;
  @ViewChild('assignSitesModal', {static: false}) assignSitesModal;

  localPageSettings: PageSettingsModel = new PageSettingsModel();
  planningsModel: PlanningsPnModel = new PlanningsPnModel();
  planningsRequestModel: PlanningsRequestModel = new PlanningsRequestModel();

  constructor(private sharedPnService: SharedPnService,
              private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService) { }

  get pluginClaimsHelper() {
    return PluginClaimsHelper;
  }

  get itemsPlanningPnClaims() {
    return ItemsPlanningPnClaims;
  }

  ngOnInit() {
    this.getLocalPageSettings();
  }

  getLocalPageSettings() {
    this.localPageSettings = this.sharedPnService.getLocalPageSettings
    ('itemsPlanningPnSettings', 'Plannings').settings;
    this.getAllInitialData();
  }

  updateLocalPageSettings() {
    this.sharedPnService.updateLocalPageSettings
    ('itemsPlanningPnSettings', this.localPageSettings, 'Plannings');
    this.getAllPlannings();
  }

  getAllInitialData() {
    this.getAllPlannings();
  }

  getAllPlannings() {
    this.planningsRequestModel.isSortDsc = this.localPageSettings.isSortDsc;
    this.planningsRequestModel.sort = this.localPageSettings.sort;
    this.planningsRequestModel.pageSize = this.localPageSettings.pageSize;
    this.itemsPlanningPnPlanningsService.getAllPlannings(this.planningsRequestModel).subscribe((data) => {
      if (data && data.success) {
        this.planningsModel = data.model;
      }
    });
  }

  showDeletePlanningModal(planning: PlanningPnModel) {
    this.deletePlanningModal.show(planning);
  }

  openEditColumnsModal(planning: PlanningPnModel) {
    this.modalCasesColumnsModal.show(planning);
  }

  sortTable(sort: string) {
    if (this.localPageSettings.sort === sort) {
      this.localPageSettings.isSortDsc = !this.localPageSettings.isSortDsc;
    } else {
      this.localPageSettings.isSortDsc = false;
      this.localPageSettings.sort = sort;
    }
    this.updateLocalPageSettings();
  }

  changePage(e: any) {
    if (e || e === 0) {
      this.planningsRequestModel.offset = e;
      if (e === 0) {
        this.planningsRequestModel.pageIndex = 0;
      } else {
        this.planningsRequestModel.pageIndex
          = Math.floor(e / this.planningsRequestModel.pageSize);
      }
      this.getAllPlannings();
    }
  }

  openAssignmentModal(planning: PlanningPnModel) {
    this.assignSitesModal.show(planning);
  }
}
