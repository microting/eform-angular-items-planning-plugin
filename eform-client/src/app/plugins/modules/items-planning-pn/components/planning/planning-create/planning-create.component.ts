import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {debounceTime, switchMap} from 'rxjs/operators';
import {ItemsPlanningPnPlanningsService} from '../../../services';
import {EFormService} from 'src/app/common/services/eform';
import {SitesService} from 'src/app/common/services/advanced';
import {AuthService} from 'src/app/common/services';
import {PlanningCreateModel} from '../../../models/plannings';
import {TemplateListModel, TemplateRequestModel} from 'src/app/common/models/eforms';
import {Location} from '@angular/common';
import moment = require('moment');
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {Subscription} from 'rxjs';

@AutoUnsubscribe()
@Component({
  selector: 'app-planning-create',
  templateUrl: './planning-create.component.html',
  styleUrls: ['./planning-create.component.scss']
})
export class PlanningCreateComponent implements OnInit, OnDestroy {
  @ViewChild('frame', {static: false}) frame;
  newPlanningModel: PlanningCreateModel = new PlanningCreateModel();
  templateRequestModel: TemplateRequestModel = new TemplateRequestModel();
  templatesModel: TemplateListModel = new TemplateListModel();
  typeahead = new EventEmitter<string>();
  createSub$: Subscription;

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

  ngOnInit() {}

  goBack() {
    this.location.back();
  }

  createPlanning() {
    if (this.newPlanningModel.internalRepeatUntil) {
      const tempDate = moment(this.newPlanningModel.internalRepeatUntil).format('DD/MM/YYYY');
      const datTime = moment.utc(tempDate, 'DD/MM/YYYY');
      this.newPlanningModel.repeatUntil = datTime.format('YYYY-MM-DD');
    }

    this.createSub$ = this.itemsPlanningPnPlanningsService.createList(this.newPlanningModel).subscribe((data) => {
      if (data && data.success) {
        this.location.back();
      }
    });
  }

  show() {
    this.frame.show();
  }

  ngOnDestroy(): void {
  }
}
