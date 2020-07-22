import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {saveAs} from 'file-saver';
import {ActivatedRoute} from '@angular/router';
import {SharedPnService} from '../../../../shared/services';
import {ItemsPlanningPnCasesService} from '../../../services';
import {PlanningCasesRequestModel} from '../../../models/plannings/planning-cases-request.model';
import {PlanningCaseResultListModel, PlanningCaseResultModel} from '../../../models/plannings';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ReportPnGenerateModel} from '../../../models/report';
import {ToastrService} from 'ngx-toastr';
import {format} from 'date-fns';
import {EFormService} from 'src/app/common/services/eform';
import {TemplateDto} from 'src/app/common/models';

@Component({
  selector: 'app-planning-case-result-page',
  templateUrl: './planning-case-result-page.component.html',
  styleUrls: ['./planning-case-result-page.component.scss']
})

export class PlanningCaseResultPageComponent implements OnInit {
  @ViewChild('uploadedDataModal', {static: false}) uploadedDataModal;
  @Output() generateReport: EventEmitter<ReportPnGenerateModel> = new EventEmitter();
  @Output() saveReport: EventEmitter<ReportPnGenerateModel> = new EventEmitter();
  generateForm: FormGroup;
  currentTemplate: TemplateDto = new TemplateDto;
  planningCaseRequestModel: PlanningCasesRequestModel = new PlanningCasesRequestModel();
  casesModel: PlanningCaseResultListModel = new PlanningCaseResultListModel();

  constructor(private activateRoute: ActivatedRoute,
              private sharedPnService: SharedPnService,
              private formBuilder: FormBuilder,
              private eFormService: EFormService,
              private itemsPlanningPnCasesService: ItemsPlanningPnCasesService,
              private toastrService: ToastrService) {
    const activatedRouteSub = this.activateRoute.params.subscribe(params => {
      this.planningCaseRequestModel.planningId = +params['id'];
    });
  }

  ngOnInit(): void {
    this.getLocalPageSettings();
    this.generateForm = this.formBuilder.group({
      dateRange: [[this.planningCaseRequestModel.dateFrom, this.planningCaseRequestModel.dateTo], Validators.required]
    });

    this.getAllCases();
  }

  onGenerateReport() {
    this.planningCaseRequestModel.offset = 0;
    this.planningCaseRequestModel.dateFrom = format(this.generateForm.value.dateRange[0], 'YYYY-MM-DD');
    this.planningCaseRequestModel.dateTo = format(this.generateForm.value.dateRange[1], 'YYYY-MM-DD');
    this.getAllCases();
  }

  onSaveReport() {
    this.planningCaseRequestModel.offset = 0;
    this.itemsPlanningPnCasesService.getGeneratedReport(this.planningCaseRequestModel).subscribe(((data) => {
      saveAs(data, this.planningCaseRequestModel.dateFrom + '_' + this.planningCaseRequestModel.dateTo + '_report.xlsx');

    }), error => {
      this.toastrService.error();

    });
  }

  getLocalPageSettings() {
    const itemsPlanningPnSettings = JSON.parse(localStorage.getItem('itemsPlanningPnSettings'));
    const settings = itemsPlanningPnSettings.find(x => x.name === 'PlanningCaseResults').settings;

    if (settings.planningId === this.planningCaseRequestModel.planningId) {
      this.planningCaseRequestModel = {
        offset: settings.offset,
        dateFrom: settings.dateFrom,
        dateTo: settings.dateTo,
        isSortDsc: settings.isSortDsc,
        planningId: settings.planningId,
        nameFilter: settings.nameFilter,
        pageIndex: settings.pageIndex,
        pageSize: settings.pageSize,
        sort: settings.sort
      };
    }
  }

  updateLocalPageSettings() {
    const itemsPlanningPnSettings = JSON.parse(localStorage.getItem('itemsPlanningPnSettings'));
    const i = itemsPlanningPnSettings.findIndex(x => x.name === 'PlanningCaseResults');
    itemsPlanningPnSettings[i].settings = this.planningCaseRequestModel;
    localStorage.setItem('itemsPlanningPnSettings', JSON.stringify(itemsPlanningPnSettings));
  }

  getReportingSettings(eformId: number) {
    this.eFormService.getSingle(eformId).subscribe(operation => {
      if (operation && operation.success) {
        this.currentTemplate = operation.model;
      }

    });
  }

  getAllCases() {
    this.updateLocalPageSettings();
    this.itemsPlanningPnCasesService.getAllCaseResults(this.planningCaseRequestModel).subscribe((data) => {
      if (data && data.success) {
        this.casesModel = data.model;
      }
      this.getReportingSettings(this.casesModel.sdkeFormId);
    });
  }

  sortTable(sort: string) {
    if (this.planningCaseRequestModel.sort === sort) {
      this.planningCaseRequestModel.isSortDsc = !this.planningCaseRequestModel.isSortDsc;
    } else {
      this.planningCaseRequestModel.isSortDsc = false;
      this.planningCaseRequestModel.sort = sort;
    }
    this.getAllCases();
  }

  changePage(offset: number) {
    this.planningCaseRequestModel.offset = offset;
    this.planningCaseRequestModel.pageIndex = offset ? offset / this.planningCaseRequestModel.pageSize : 1;
    this.getAllCases();
  }

  changePageSize(n: number) {
    this.planningCaseRequestModel.pageSize = n;
    this.planningCaseRequestModel.offset = 0;
    this.getAllCases();
  }

  showListCasePdfModal(itemCase: PlanningCaseResultModel) {
    this.uploadedDataModal.show(itemCase);
  }

  downloadFile(itemCase: PlanningCaseResultModel, fileType: string) {
    window.open('/api/items-planning-pn/plannings-case-file-report/' +
      itemCase.id + '?token=' + itemCase.token + '&fileType=' + fileType, '_blank');
  }
}
