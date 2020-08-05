import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {LocaleService} from 'src/app/common/services/auth';
import {format} from 'date-fns';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ReportPnGenerateModel} from '../../../models/report';
import {PlanningsRequestModel, PlanningsPnModel} from '../../../models/plannings';
import {debounceTime, switchMap} from 'rxjs/operators';
import {ItemsPlanningPnPlanningsService} from '../../../services';
import {PlanningItemModel} from '../../../models/plannings';
import {DateTimeAdapter} from 'ng-pick-datetime-ex';

@Component({
  selector: 'app-items-planning-pn-report-header',
  templateUrl: './report-header.component.html',
  styleUrls: ['./report-header.component.scss']
})
export class ReportHeaderComponent implements OnInit {
  @Output() generateReport: EventEmitter<ReportPnGenerateModel> = new EventEmitter();
  @Output() downloadReport: EventEmitter<ReportPnGenerateModel> = new EventEmitter();
  generateForm: FormGroup;

  constructor(dateTimeAdapter: DateTimeAdapter<any>,
              private localeService: LocaleService,
              private formBuilder: FormBuilder) {
    dateTimeAdapter.setLocale(this.localeService.getCurrentUserLocale());
  }

  ngOnInit() {
    this.generateForm = this.formBuilder.group({
      dateRange: ['', Validators.required],
    });
  }

  onSubmit() {
    const model = this.extractData(this.generateForm.value);
    this.generateReport.emit(model);
  }

  onSave() {
    const model = this.extractData(this.generateForm.value);
    this.downloadReport.emit(model);
  }

  private extractData(formValue: any): ReportPnGenerateModel {
    return new ReportPnGenerateModel(
      {
        dateFrom: format(formValue.dateRange[0], 'yyyy-MM-dd'),
        dateTo: format(formValue.dateRange[1], 'yyyy-MM-dd')
      }
    );
  }

}
