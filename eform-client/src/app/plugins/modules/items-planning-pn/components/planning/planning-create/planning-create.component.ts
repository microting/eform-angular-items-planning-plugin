import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {debounceTime, switchMap} from 'rxjs/operators';
import {ItemsPlanningPnPlanningsService} from '../../../services';
import {EFormService} from 'src/app/common/services/eform';
import {SitesService} from 'src/app/common/services/advanced';
import {AuthService} from 'src/app/common/services';
import {PlanningCreateModel, PlanningItemModel} from '../../../models/plannings';
import {TemplateListModel, TemplateRequestModel} from 'src/app/common/models/eforms';
import {Location} from '@angular/common';
import moment = require('moment');


@Component({
  selector: 'app-planning-create',
  templateUrl: './planning-create.component.html',
  styleUrls: ['./planning-create.component.scss']
})
export class PlanningCreateComponent implements OnInit {
  @ViewChild('frame', {static: false}) frame;
  @ViewChild('unitImportModal', {static: false}) importUnitModal;
  @Output() planningCreated: EventEmitter<void> = new EventEmitter<void>();
  newPlanningModel: PlanningCreateModel = new PlanningCreateModel();
  templateRequestModel: TemplateRequestModel = new TemplateRequestModel();
  templatesModel: TemplateListModel = new TemplateListModel();
  typeahead = new EventEmitter<string>();

  get userClaims() {
    return this.authService.userClaims;
  }

  constructor(private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService,
              private sitesService: SitesService,
              private authService: AuthService,
              private eFormService: EFormService,
              private cd: ChangeDetectorRef,
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
  }

  ngOnInit() {
    // this.loadAllSites();
  }

  goBack() {
    this.location.back();
  }

  createPlanning() {
    if (this.newPlanningModel.internalRepeatUntil) {
      const tempDate = moment(this.newPlanningModel.internalRepeatUntil).format('DD/MM/YYYY');
      const datTime = moment.utc(tempDate, 'DD/MM/YYYY');
      this.newPlanningModel.repeatUntil = datTime.format('YYYY-MM-DD');
    }

    this.itemsPlanningPnPlanningsService.createList(this.newPlanningModel).subscribe((data) => {
      if (data && data.success) {
        this.planningCreated.emit();
        // this.submitDeployment();
        this.newPlanningModel = new PlanningCreateModel();
        this.location.back();
      }
    });
  }

  show() {
    this.frame.show();
  }

  showImportModal() {
    this.importUnitModal.show();
  }

  addNewItem() {
    const newPlanningItem = new PlanningItemModel();
    if (!this.newPlanningModel.items.length) {
      newPlanningItem.id = this.newPlanningModel.items.length;
    } else {
      newPlanningItem.id = this.newPlanningModel.items[this.newPlanningModel.items.length - 1].id + 1;
    }
    this.newPlanningModel.items.push(newPlanningItem);
  }

  removeItem(id: number) {
    this.newPlanningModel.items = this.newPlanningModel.items.filter(x => x.id !== id);
  }
}
