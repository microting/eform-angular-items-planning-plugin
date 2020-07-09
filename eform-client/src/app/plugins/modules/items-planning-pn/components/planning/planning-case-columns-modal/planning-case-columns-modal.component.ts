import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {TemplateColumnModel, UpdateColumnsModel} from 'src/app/common/models/cases';
import {TemplateDto} from 'src/app/common/models/dto';
import {PlanningPnModel, PlanningUpdateModel} from '../../../models/plannings';
import {ItemsPlanningPnPlanningsService} from '../../../services';
import {TemplateListModel} from 'src/app/common/models';
import {EFormService} from 'src/app/common/services/eform';
import moment = require('moment');


@Component({
  selector: 'app-planning-case-column-modal',
  templateUrl: './planning-case-columns-modal.component.html',
  styleUrls: ['./planning-case-columns-modal.component.scss']
})
export class PlanningCaseColumnsModalComponent implements OnInit {
  @ViewChild('frame', {static: false}) frame;
  @Output() onPlanningUpdated: EventEmitter<void> = new EventEmitter<void>();
  selectedPlanningModel: PlanningPnModel = new PlanningPnModel();
  templatesModel: TemplateListModel = new TemplateListModel();

  columnEditModel: UpdateColumnsModel = new UpdateColumnsModel;
  columnModels: Array<TemplateColumnModel> = [];

  constructor(private eFormService: EFormService,
              private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService) { }

  ngOnInit() {
  }

  show(planningModel: PlanningPnModel) {
    this.getSelectedPlanning(planningModel.id);
    // this.selectedTemplateDto = selectedTemplate;
    this.getColumnsForTemplate(planningModel.relatedEFormId);
    this.frame.show();
  }



  getSelectedPlanning(id: number) {
    this.itemsPlanningPnPlanningsService.getSinglePlanning(id).subscribe((data) => {
      if (data && data.success) {
        this.selectedPlanningModel = data.model;
        // @ts-ignore
        this.templatesModel.templates = [{id: this.selectedPlanningModel.relatedEFormId, label: this.selectedPlanningModel.relatedEFormName}];
      }
    });
  }

  updatePlanning() {
    const model = new PlanningUpdateModel(this.selectedPlanningModel);
    if (this.selectedPlanningModel.repeatUntil) {
      const datTime = moment(this.selectedPlanningModel.repeatUntil);
    }
    this.itemsPlanningPnPlanningsService.updatePlanning(model)
      .subscribe((data) => {
        if (data && data.success) {
          this.onPlanningUpdated.emit();
          this.selectedPlanningModel = new PlanningPnModel();
          this.frame.hide();
        }
      });
  }

  getColumnsForTemplate(relatedeFormId: number) {
    this.eFormService.getTemplateColumns(relatedeFormId).subscribe((operation) => {
      if (operation && operation.success) {
        this.columnModels = operation.model;
        // this.eFormService.getCurrentTemplateColumns(this.selectedTemplateDto.id).subscribe((result) => {
        //   if (result && result.success) {
        //     this.columnEditModel = result.model;
        //   }
        // });
      }
    });
  }
}
