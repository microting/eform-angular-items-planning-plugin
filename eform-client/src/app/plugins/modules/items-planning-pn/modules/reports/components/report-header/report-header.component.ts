import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { format, parseISO } from 'date-fns';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportPnGenerateModel } from '../../../../models';
import { DateTimeAdapter } from '@danielmoncada/angular-datetime-picker';
import { SharedTagModel } from 'src/app/common/models';
import { AuthStateService } from 'src/app/common/store';
import { PlanningsReportQuery, PlanningsReportStateService } from '../store';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Subscription } from 'rxjs';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ExcelIcon, WordIcon} from 'src/app/common/const';

@AutoUnsubscribe()
@Component({
  selector: 'app-items-planning-pn-report-header',
  templateUrl: './report-header.component.html',
  styleUrls: ['./report-header.component.scss'],
})
export class ReportHeaderComponent implements OnInit, OnDestroy {
  @Output()
  generateReport: EventEmitter<ReportPnGenerateModel> = new EventEmitter();
  @Output()
  downloadReport: EventEmitter<ReportPnGenerateModel> = new EventEmitter();
  @Output()
  downloadExcelReport: EventEmitter<ReportPnGenerateModel> = new EventEmitter();
  @Input() range: Date[];
  @Input() availableTags: SharedTagModel[] = [];
  generateForm: FormGroup;
  valueChangesSub$: Subscription;

  constructor(
    dateTimeAdapter: DateTimeAdapter<any>,
    private formBuilder: FormBuilder,
    private planningsReportStateService: PlanningsReportStateService,
    private planningsReportQuery: PlanningsReportQuery,
    authStateService: AuthStateService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
  ) {
    iconRegistry.addSvgIconLiteral('file-word', sanitizer.bypassSecurityTrustHtml(WordIcon));
    iconRegistry.addSvgIconLiteral('file-excel', sanitizer.bypassSecurityTrustHtml(ExcelIcon));
    dateTimeAdapter.setLocale(authStateService.currentUserLocale);
  }

  get dateRange() {
    return this.generateForm.get('dateRange');
  }

  ngOnInit() {
    this.generateForm = this.formBuilder.group({
      dateRange: [
        this.planningsReportQuery.pageSetting.dateRange,
        Validators.required,
      ],
      tagIds: [this.planningsReportQuery.pageSetting.filters.tagIds],
    });
    this.valueChangesSub$ = this.generateForm.valueChanges.subscribe(
      (value: { tagIds: number[]; dateRange: string[] }) => {
        if (value.dateRange.length) {
          const dateFrom = value.dateRange[0];
          const dateTo = value.dateRange[1];
          this.planningsReportStateService.updateDateRange([dateFrom, dateTo]);
        }
      }
    );
    if (!!this.range[0].getDate()) {
      this.generateForm.get('dateRange').setValue(this.range);
    }
  }

  onSubmit() {
    const model = this.extractData();
    this.generateReport.emit(model);
  }

  onSave() {
    const model = this.extractData();
    model.type = 'docx';
    this.downloadReport.emit(model);
  }

  onExcelSave() {
    const model = this.extractData();
    model.type = 'xlsx';
    this.downloadExcelReport.emit(model);
  }

  private extractData(): ReportPnGenerateModel {
    return new ReportPnGenerateModel({
      dateFrom: this.planningsReportQuery.pageSetting.dateRange[0],
      dateTo: this.planningsReportQuery.pageSetting.dateRange[1],
      tagIds: [...this.planningsReportQuery.pageSetting.filters.tagIds],
    });
  }

  addOrDeleteTagId(tag: SharedTagModel) {
    this.planningsReportStateService.addOrRemoveTagIds(tag.id);
  }

  ngOnDestroy(): void {}
}
