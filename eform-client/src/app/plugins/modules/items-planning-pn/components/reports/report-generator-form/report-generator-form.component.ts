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
  selector: 'app-items-planning-pn-report-generator-form',
  templateUrl: './report-generator-form.component.html',
  styleUrls: ['./report-generator-form.component.scss']
})
export class ReportGeneratorFormComponent implements OnInit {
  @Output() generateReport: EventEmitter<ReportPnGenerateModel> = new EventEmitter();
  @Output() saveReport: EventEmitter<ReportPnGenerateModel> = new EventEmitter();
  generateForm: FormGroup;
  typeahead = new EventEmitter<string>();
  itemLists: PlanningsPnModel = new PlanningsPnModel();
  items: Array<PlanningItemModel> = [];
  listRequestModel: PlanningsRequestModel = new PlanningsRequestModel();

  constructor(dateTimeAdapter: DateTimeAdapter<any>,
              private localeService: LocaleService,
              private formBuilder: FormBuilder,
              private listsService: ItemsPlanningPnPlanningsService,
              private cd: ChangeDetectorRef) {
    dateTimeAdapter.setLocale(this.localeService.getCurrentUserLocale());
    this.typeahead
      .pipe(
        debounceTime(200),
        switchMap(term => {
          this.listRequestModel.nameFilter = term;
          return this.listsService.getAllPlannings(this.listRequestModel);
        })
      )
      .subscribe(itemLists => {
        this.itemLists = itemLists.model;
        this.cd.markForCheck();
      });
  }

  ngOnInit() {
    this.generateForm = this.formBuilder.group({
      dateRange: ['', Validators.required],
      itemList: [null, Validators.required],
      item: [null, Validators.required]
    });
  }

  onSubmit() {
    const model = this.extractData(this.generateForm.value);
    this.generateReport.emit(model);
  }

  onSave() {
    const model = this.extractData(this.generateForm.value);
    this.saveReport.emit(model);
  }

  onItemListSelected(e: any) {
    this.listsService.getSinglePlanning(e.id)
      .subscribe(itemList => {
        this.items = itemList.model.items;
        this.cd.markForCheck();
      });
  }

  private extractData(formValue: any): ReportPnGenerateModel {
    return new ReportPnGenerateModel(
      {
        itemList: formValue.itemList,
        item: formValue.item,
        dateFrom: format(formValue.dateRange[0], 'YYYY-MM-DD'),
        dateTo: format(formValue.dateRange[1], 'YYYY-MM-DD')
      }
    );
  }

}
