import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {ItemsPlanningPnPlanningsService} from 'src/app/plugins/modules/items-planning-pn/services';
import {PlanningItemModel, PlanningPnModel, PlanningUpdateModel} from '../../../models/plannings';
import {TemplateListModel, TemplateRequestModel} from '../../../../../../common/models/eforms';
import {debounceTime, switchMap} from 'rxjs/operators';
import {EFormService} from 'src/app/common/services/eform';
import * as moment from 'moment';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

@Component({
  selector: 'app-planning-edit',
  templateUrl: './planning-edit.component.html',
  styleUrls: ['./planning-edit.component.scss']
})
export class PlanningEditComponent implements OnInit {
  @ViewChild('frame', {static: false}) frame;
  @ViewChild('unitImportModal', {static: false}) importUnitModal;
  @Output() planningUpdated: EventEmitter<void> = new EventEmitter<void>();
  selectedPlanningModel: PlanningPnModel = new PlanningPnModel();
  templateRequestModel: TemplateRequestModel = new TemplateRequestModel();
  templatesModel: TemplateListModel = new TemplateListModel();
  typeahead = new EventEmitter<string>();
  selectedListId: number;
  constructor(private activateRoute: ActivatedRoute,
              private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService,
              private cd: ChangeDetectorRef,
              private eFormService: EFormService,
              private location: Location) {
    this.typeahead
      .pipe(
        debounceTime(200),
        switchMap(term => {
          this.templateRequestModel.nameFilter = term;
          return this.eFormService.getAll(this.templateRequestModel);
        })
      )
      .subscribe(items => {
        this.templatesModel = items.model;
        this.cd.markForCheck();
      });
    const activatedRouteSub = this.activateRoute.params.subscribe(params => {
      this.selectedListId = +params['id'];
    });
  }

  ngOnInit() {
    this.getSelectedList(this.selectedListId);
  }

  getSelectedList(id: number) {
    this.itemsPlanningPnPlanningsService.getSinglePlanning(id).subscribe((data) => {
      if (data && data.success) {
        this.selectedPlanningModel = data.model;
        this.selectedPlanningModel.internalRepeatUntil = this.selectedPlanningModel.repeatUntil;
        this.templatesModel.templates = [
          {id: this.selectedPlanningModel.relatedEFormId, label: this.selectedPlanningModel.relatedEFormName} as any
        ];
      }
    });
  }

  goBack() {
    this.location.back();
  }

  updateList() {if (this.selectedPlanningModel.internalRepeatUntil) {
      const tempDate = moment(this.selectedPlanningModel.internalRepeatUntil).format('DD/MM/YYYY');
      const datTime = moment.utc(tempDate, 'DD/MM/YYYY');
      this.selectedPlanningModel.repeatUntil = datTime.format('YYYY-MM-DDT00:00:00').toString();
    }
    const model = {...this.selectedPlanningModel} as PlanningUpdateModel;
    this.itemsPlanningPnPlanningsService.updatePlanning(model)
      .subscribe((data) => {
      if (data && data.success) {
        this.planningUpdated.emit();
        this.selectedPlanningModel = new PlanningPnModel();
        this.goBack();
      }
    });
  }
}
