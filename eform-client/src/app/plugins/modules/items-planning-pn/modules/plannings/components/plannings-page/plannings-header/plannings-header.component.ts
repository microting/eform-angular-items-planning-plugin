import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject
} from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MtxSelect} from '@ng-matero/extensions/select';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {AsyncPipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import { CommonDictionaryModel, SiteNameDto } from 'src/app/common/models';
import { PlanningsStateService } from '../../store';
import {Store} from "@ngrx/store";
import {PlanningsState} from "src/app/plugins/modules/items-planning-pn/state/plannings/plannings.reducer";
import {
  selectPlanningsDescriptionFilter,
  selectPlanningsDeviceUserIds, selectPlanningsNameFilter,
  selectPlanningsTagsIds
} from "src/app/plugins/modules/items-planning-pn/state/plannings/plannings.selector";

@Component({
    selector: 'app-plannings-header',
    templateUrl: './plannings-header.component.html',
    styleUrls: ['./plannings-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatFormField, MatLabel, MtxSelect, FormsModule, MatInput, AsyncPipe, TranslatePipe]
})
export class PlanningsHeaderComponent implements OnInit {
  private planningsStore = inject(Store);
  public planningsStateService = inject(PlanningsStateService);

  @Input() availableTags: CommonDictionaryModel[] = [];
  @Input() sites: SiteNameDto[] = [];
  @Output() tagSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() savedTagRemoved: EventEmitter<any> = new EventEmitter<any>();
  @Output() siteSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() savedSiteRemoved: EventEmitter<any> = new EventEmitter<any>();
  @Output() nameFilterChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  descriptionFilterChanged: EventEmitter<any> = new EventEmitter<any>();
  public selectPlanningsTagsIds$ = this.planningsStore.select(selectPlanningsTagsIds);
  public selectPlanningsDeviceUserIds$ = this.planningsStore.select(selectPlanningsDeviceUserIds);
  public selectPlanningsDescriptionFilter$ = this.planningsStore.select(selectPlanningsDescriptionFilter);
  public selectPlanningsNameFilter$ = this.planningsStore.select(selectPlanningsNameFilter);

  ngOnInit(): void {}

  saveTag(e: any) {
    this.tagSaved.emit(e);
  }

  removeSavedTag(e: any) {
    this.savedTagRemoved.emit(e);
  }

  saveSite(e: any) {
    this.siteSaved.emit(e);
  }

  removeSavedSite(e: any) {
    this.savedSiteRemoved.emit(e);
  }

  onNameFilterChanged(value: any) {
    this.nameFilterChanged.emit(value);
  }

  onDescriptionFilterChanged(value: any) {
    this.descriptionFilterChanged.emit(value);
  }
}
