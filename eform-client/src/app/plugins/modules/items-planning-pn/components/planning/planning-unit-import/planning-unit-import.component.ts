import { Component, OnInit, ViewChild } from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import {Papa} from 'ngx-papaparse';
import {PlanningHeadersModel, PlanningUnitImportModel} from '../../../models/plannings';
import {ItemsPlanningPnPlanningsService} from '../../../services';

const URL = '';

@Component({
  selector: 'app-planning-unit-import',
  templateUrl: './planning-unit-import.component.html',
  styleUrls: ['./planning-unit-import.component.scss']
})
export class PlanningUnitImportComponent implements OnInit {
  @ViewChild('frame', {static: false}) frame;
  public data: any = [];
  uploader: FileUploader;
  unitImportModel: PlanningUnitImportModel;
  unitHeaderModel: PlanningHeadersModel;
  fileName: string;
  totalColumns: number;
  totalRows: number;
  myFile: any;
  chboxNames = ['Exclude the first row', 'Ignore all unselected fields', 'Manage matching records'];
  papa: Papa = new Papa();
  tableData: any = null;
  options = [
    {value: 0, label: 'Number'},
    {value: 1, label: 'Name'},
    {value: 2, label: 'Build Year'},
    {value: 3, label: 'Type'}
  ];
  constructor(private planningsService: ItemsPlanningPnPlanningsService) {
    this.unitImportModel = new PlanningUnitImportModel();
    this.options.forEach((option) => {
        this.unitHeaderModel = new PlanningHeadersModel();
        this.unitHeaderModel.headerLabel = option.label;
        this.unitHeaderModel.headerValue = null;
        this.unitImportModel.headerList.push(this.unitHeaderModel);
        // console.log(label);
      }
    );
    this.uploader = new FileUploader(
      {
        url: URL,
        autoUpload: true,
        isHTML5: true,
        removeAfterUpload: true
      });
    this.uploader.onAfterAddingFile = (fileItem => {
      fileItem.withCredentials = false;
      // console.log(fileItem._file);
      this.myFile = fileItem.file.rawFile;
    });
  }



  ngOnInit() {
    this.fileName = 'DummyCustomerData.csv';
    this.totalColumns = 4;
    this.totalRows = 100;
  }
  csv2Array(fileInput) {
    const file = fileInput;
    this.papa.parse(fileInput.target.files[0], {
      skipEmptyLines: true,
      header: false,
      complete: (results) => {
        this.tableData = results.data;
        console.log(this.tableData);
        this.unitImportModel.importList = JSON.stringify(this.tableData);
      }
    });
    return this.tableData;
  }

  importUnit() {
    this.unitImportModel.headers = JSON.stringify(this.unitImportModel.headerList);
    return this.planningsService.importUnit(this.unitImportModel).subscribe(((data) => {
      if (data && data.success) {
        this.unitImportModel = new PlanningUnitImportModel();
      }
    }));
}
  logThings(value) {
    console.log(value);
  }
  onSelectedChanged(e: any, columnIndex: any) {
    this.unitImportModel.headerList[e.value].headerValue = columnIndex;
  }
  show() {
    this.frame.show();
  }
}
