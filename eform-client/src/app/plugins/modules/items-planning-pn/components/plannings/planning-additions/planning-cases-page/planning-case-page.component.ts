import {Component, OnInit, ViewChild} from '@angular/core';
import {SharedPnService} from '../../../../../shared/services';
import {ActivatedRoute} from '@angular/router';
import {PageSettingsModel} from '../../../../../../../common/models/settings';
import {PlanningCasesModel, PlanningCaseModel} from '../../../../models/plannings/planning-cases/planning-cases.model';
import {ItemsPlanningPnCasesService} from '../../../../services/items-planning-pn-cases.service';
import {PlanningCasesRequestModel} from '../../../../models/plannings/planning-cases/planning-cases-request.model';

@Component({
  selector: 'app-planning-case-page',
  templateUrl: './planning-case-page.component.html',
  styleUrls: ['./planning-case-page.component.scss']
})

export class PlanningCasePageComponent implements OnInit {
  @ViewChild('uploadedDataModal', {static: false}) uploadedDataModal;
  localPageSettings: PageSettingsModel = new PageSettingsModel();
  planningCaseRequestModel: PlanningCasesRequestModel = new PlanningCasesRequestModel();
  casesModel: PlanningCasesModel = new PlanningCasesModel();
  id: number;

  constructor(private activateRoute: ActivatedRoute,
              private sharedPnService: SharedPnService,
              private itemsPlanningPnCasesService: ItemsPlanningPnCasesService) {
    const activatedRouteSub = this.activateRoute.params.subscribe(params => {
      this.id = +params['id'];
    });
  }

  ngOnInit(): void {
    this.getLocalPageSettings();
  }

  getLocalPageSettings() {
    this.localPageSettings = this.sharedPnService.getLocalPageSettings
    ('itemsPlanningPnSettings', 'PlanningCases').settings;
    this.getAllInitialData();
  }

  updateLocalPageSettings() {
    this.sharedPnService.updateLocalPageSettings
    ('itemsPlanningPnSettings', this.localPageSettings, 'PlanningCases');
    this.getAllCases();
  }

  getAllInitialData() {
    this.getAllCases();
  }
  showPlanningCasePdfModal(itemCase: PlanningCaseModel) {
    this.uploadedDataModal.show(itemCase);
  }
  getAllCases() {
    this.planningCaseRequestModel.isSortDsc = this.localPageSettings.isSortDsc;
    this.planningCaseRequestModel.sort = this.localPageSettings.sort;
    this.planningCaseRequestModel.pageSize = this.localPageSettings.pageSize;
    this.planningCaseRequestModel.planningId = this.id;
    this.itemsPlanningPnCasesService.getAllCases(this.planningCaseRequestModel).subscribe((data) => {
      if (data && data.success) {
        this.casesModel = data.model;
      }
    });
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
      this.planningCaseRequestModel.offset = e;
      if (e === 0) {
        this.planningCaseRequestModel.pageIndex = 0;
      } else {
        this.planningCaseRequestModel.pageIndex
          = Math.floor(e / this.planningCaseRequestModel.pageSize);
      }
      this.getAllCases();
    }
  }
}
