import {ChangeDetectorRef, Component, EventEmitter, OnInit} from '@angular/core';
import { ItemsPlanningPnSettingsService} from '../../services';
import {Router} from '@angular/router';
import {debounceTime, switchMap} from 'rxjs/operators';
import {EntitySearchService} from '../../../../../common/services/advanced';
import {TemplateListModel, TemplateRequestModel} from '../../../../../common/models/eforms';
import {EFormService} from '../../../../../common/services/eform';
import {ItemsPlanningBaseSettingsModel} from '../../models/items-planning-base-settings.model';

@Component({
  selector: 'app-items-planning-settings',
  templateUrl: './items-planning-settings.component.html',
  styleUrls: ['./items-planning-settings.component.scss']
})
export class ItemsPlanningSettingsComponent implements OnInit {
  typeahead = new EventEmitter<string>();
  settingsModel: ItemsPlanningBaseSettingsModel = new ItemsPlanningBaseSettingsModel();
  templatesModel: TemplateListModel = new TemplateListModel();
  templateRequestModel: TemplateRequestModel = new TemplateRequestModel();

  constructor(
    private itemsPlanningPnSettingsService: ItemsPlanningPnSettingsService,
    private router: Router,
    private eFormService: EFormService,
    private entitySearchService: EntitySearchService,
    private cd: ChangeDetectorRef) {
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
    this.getSettings();
  }

  getSettings() {
    this.itemsPlanningPnSettingsService.getAllSettings().subscribe((data) => {
      if (data && data.success) {
        this.settingsModel = data.model;
      }
    });
  }
  updateSettings() {
    this.itemsPlanningPnSettingsService.updateSettings(this.settingsModel)
      .subscribe((data) => {
        if (data && data.success) {

        }
      });
  }
}
