import {Component, OnInit, ViewChild} from '@angular/core';
import {PlanningCaseModel} from '../../../models/plannings/planning-cases.model';
import {ItemsPlanningPnCasesService, ItemsPlanningPnUploadedDataService} from '../../../services';
import {PlanningCaseResultModel, UploadedDataModel, UploadedDatasModel} from '../../../models/plannings';

@Component({
  selector: 'app-planning-case-uploaded-data',
  templateUrl: './planning-case-uploaded-data.component.html',
  styleUrls: ['./planning-case-uploaded-data.component.scss']
})
export class PlanningCaseUploadedDataComponent implements OnInit {
  @ViewChild('frame', {static: false}) frame;
  @ViewChild('uploadedDataPdfModal', {static: false}) uploadedDataPdfModal;
  @ViewChild('uploadedDataDeleteModal', {static: false}) uploadedDataDeleteModal;
  uploadedDatasModel: UploadedDatasModel = new UploadedDatasModel();
  selectedPlanningCase: PlanningCaseModel = new PlanningCaseModel();
  selectedPlanningCaseId: number;

  constructor( private itemsPlanningPnCasesService: ItemsPlanningPnCasesService,
               private itemsPlanningPnUploadedDataService: ItemsPlanningPnUploadedDataService) { }

  ngOnInit() {
  }

  show(selectedPlanningCase: PlanningCaseResultModel) {
    this.selectedPlanningCaseId = selectedPlanningCase.id;
    this.getSelectedPlanningCase(selectedPlanningCase.id);
  }

  getSelectedPlanningCase(id: number) {
    this.itemsPlanningPnCasesService.getSingleCase(id).subscribe((data) => {
      if (data && data.success) {
        this.selectedPlanningCase = data.model;
        this.frame.show(this.selectedPlanningCase);
        this.getAllUploadedData(id);
      }
    });
  }

  getAllUploadedData(itemCaseId: number) {
    this.itemsPlanningPnUploadedDataService.getAllUploadedData(itemCaseId).subscribe((data) => {
      if (data && data.success) {
        this.uploadedDatasModel = data.model;
      }
    });
  }

  getMessage() {
    this.getAllUploadedData(this.selectedPlanningCaseId);
  }

  downloadUploadedDataPdf(fileName: string) {
    // this.itemsPlanningPnUploadedDataService.downloadUploadedDataPdf(fileName);
    window.open('api/template-files/get-pdf/' + fileName);
  }

  showUploadPDFModal() {
    this.uploadedDataPdfModal.show(this.selectedPlanningCase);
  }

  showUploadedDataDeleteModal(uploadedData: UploadedDataModel) {
    this.uploadedDataDeleteModal.show(uploadedData);
  }
}
