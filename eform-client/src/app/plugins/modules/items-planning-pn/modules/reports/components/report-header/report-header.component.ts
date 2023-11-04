import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import {format, parse, parseISO} from 'date-fns';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ReportPnGenerateModel} from '../../../../models';
import {DateTimeAdapter} from '@danielmoncada/angular-datetime-picker';
import {SharedTagModel} from 'src/app/common/models';
import {AuthStateService} from 'src/app/common/store';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {Subscription} from 'rxjs';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ExcelIcon, PARSING_DATE_FORMAT, WordIcon} from 'src/app/common/const';
import {selectCurrentUserLocale} from 'src/app/state/auth/auth.selector';
import {Store} from '@ngrx/store';
import {PlanningsReportStateService} from 'src/app/plugins/modules/items-planning-pn/modules/reports/components/store';
import {PlanningsState} from 'src/app/plugins/modules/items-planning-pn/state/plannings/plannings.reducer';
import {
  selectReportsDateRange,
  selectReportsFilters
} from 'src/app/plugins/modules/items-planning-pn/state/reports/reports.selector';

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
  private selectCurrentUserLocale$ = this.authStore.select(selectCurrentUserLocale);
  private selectReportsFilters$ = this.planningStore.select(selectReportsFilters);
  private selectReportsDateRange$ = this.planningStore.select(selectReportsDateRange);

  constructor(
    dateTimeAdapter: DateTimeAdapter<any>,
    private planningStore: Store,
    private formBuilder: FormBuilder,
    private authStore: Store,
    private planningsReportStateService: PlanningsReportStateService,
    authStateService: AuthStateService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
  ) {
    iconRegistry.addSvgIconLiteral('file-word', sanitizer.bypassSecurityTrustHtml(WordIcon));
    iconRegistry.addSvgIconLiteral('file-excel', sanitizer.bypassSecurityTrustHtml(ExcelIcon));
    this.selectCurrentUserLocale$.subscribe((locale) => {
      dateTimeAdapter.setLocale(locale);
    });
  }

  get dateRange() {
    return this.generateForm.get('dateRange');
  }

  ngOnInit() {
    this.selectReportsFilters$.subscribe((filters) => {
      if (filters === undefined) {
        return;
      }
      this.generateForm.get('tagIds').setValue(filters.tagIds);
    }).unsubscribe();
    this.selectReportsDateRange$.subscribe((dateRange) => {
      if (dateRange === undefined) {
        return;
      }
      this.generateForm.get('startDate').setValue(parseISO(dateRange.startDate));
      this.generateForm.get('endDate').setValue(parseISO(dateRange.endDate));
    }).unsubscribe();
    // this.generateForm = this.formBuilder.group({
    //   startDate: new FormControl(this.planningsReportQuery.pageSetting.dateRange.startDate ?
    //     parse(this.planningsReportQuery.pageSetting.dateRange.startDate, PARSING_DATE_FORMAT, new Date()) : null, [Validators.required]),
    //   endDate: new FormControl(this.planningsReportQuery.pageSetting.dateRange.endDate ?
    //     parse(this.planningsReportQuery.pageSetting.dateRange.endDate, PARSING_DATE_FORMAT, new Date()) : null, [Validators.required]),
    //   tagIds: [this.planningsReportQuery.pageSetting.filters.tagIds],
    // });
    this.valueChangesSub$ = this.generateForm.valueChanges.subscribe(
      (value: { tagIds: number[]; startDate: Date; endDate: Date; }) => {
        if (value.startDate) {
          const dateFrom = format(value.startDate, PARSING_DATE_FORMAT);
          this.planningsReportStateService.updateDateRange({startDate: dateFrom});
        }
        if (value.endDate) {
          const dateTo = format(value.endDate, PARSING_DATE_FORMAT);
          this.planningsReportStateService.updateDateRange({endDate: dateTo});
        }
      }
    );
    if (!!this.range[0].getDate()) {
      this.generateForm.get('startDate').setValue(this.range[0]);
      this.generateForm.get('endDate').setValue(this.range[1]);
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
    this.selectReportsDateRange$.subscribe((dateRange) => {
      if (dateRange === undefined) {
        return;
      }
      this.generateForm.get('startDate').setValue(parseISO(dateRange.startDate));
      this.generateForm.get('endDate').setValue(parseISO(dateRange.endDate));
    }).unsubscribe();
    const {startDate, endDate, tagIds} = this.generateForm.value;
    const dateFrom = format(startDate, PARSING_DATE_FORMAT);
    const dateTo = format(endDate, PARSING_DATE_FORMAT);
    return new ReportPnGenerateModel({
      dateFrom: dateFrom,
      dateTo: dateTo,
      tagIds: [...tagIds],
    });
    // return new ReportPnGenerateModel({
    //   dateFrom: this.planningsReportQuery.pageSetting.dateRange.startDate,
    //   dateTo: this.planningsReportQuery.pageSetting.dateRange.endDate,
    //   tagIds: [...this.planningsReportQuery.pageSetting.filters.tagIds],
    // });
  }

  addOrDeleteTagId(tag: SharedTagModel) {
    this.planningsReportStateService.addOrRemoveTagIds(tag.id);
  }

  ngOnDestroy(): void {
  }
}
