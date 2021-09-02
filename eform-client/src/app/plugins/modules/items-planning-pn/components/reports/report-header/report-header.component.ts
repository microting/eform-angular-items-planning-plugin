import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { format } from 'date-fns';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportPnGenerateModel } from '../../../models/report';
import { DateTimeAdapter } from '@danielmoncada/angular-datetime-picker';
import { SharedTagModel } from 'src/app/common/models';
import { AuthStateService } from 'src/app/common/store';
import { PlanningsReportQuery, PlanningsReportStateService } from '../store';

@Component({
  selector: 'app-items-planning-pn-report-header',
  templateUrl: './report-header.component.html',
  styleUrls: ['./report-header.component.scss'],
})
export class ReportHeaderComponent implements OnInit {
  @Output()
  generateReport: EventEmitter<ReportPnGenerateModel> = new EventEmitter();
  @Output()
  downloadReport: EventEmitter<ReportPnGenerateModel> = new EventEmitter();
  @Output()
  downloadExcelReport: EventEmitter<ReportPnGenerateModel> = new EventEmitter();
  @Input() range: Date[];
  @Input() availableTags: SharedTagModel[] = [];
  generateForm: FormGroup;

  constructor(
    dateTimeAdapter: DateTimeAdapter<any>,
    private formBuilder: FormBuilder,
    private planningsReportStateService: PlanningsReportStateService,
    private planningsReportQuery: PlanningsReportQuery,
    authStateService: AuthStateService
  ) {
    dateTimeAdapter.setLocale(authStateService.currentUserLocale);
  }

  ngOnInit() {
    this.generateForm = this.formBuilder.group({
      dateRange: ['', Validators.required],
      tagIds: [this.planningsReportQuery.pageSetting.filters.tagIds],
    });
  }

  onSubmit() {
    const model = this.extractData(this.generateForm.value);
    this.generateReport.emit(model);
  }

  onSave() {
    const model = this.extractData(this.generateForm.value);
    model.type = 'docx';
    this.downloadReport.emit(model);
  }

  onExcelSave() {
    const model = this.extractData(this.generateForm.value);
    model.type = 'xlsx';
    this.downloadExcelReport.emit(model);
  }

  private extractData(formValue: any): ReportPnGenerateModel {
    return new ReportPnGenerateModel({
      dateFrom: format(formValue.dateRange[0], 'yyyy-MM-dd'),
      dateTo: format(formValue.dateRange[1], 'yyyy-MM-dd'),
      tagIds: [...this.planningsReportQuery.getValue().filters.tagIds],
    });
  }

  addOrDeleteTagId(tag: SharedTagModel) {
    this.planningsReportStateService.addOrRemoveTagIds(tag.id);
  }
}
