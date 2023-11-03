import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
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
})
export class PlanningsHeaderComponent implements OnInit {
  @Input() availableTags: CommonDictionaryModel[] = [];
  @Input() sites: SiteNameDto[] = [];
  @Output() tagSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() savedTagRemoved: EventEmitter<any> = new EventEmitter<any>();
  @Output() siteSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() savedSiteRemoved: EventEmitter<any> = new EventEmitter<any>();
  @Output() nameFilterChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  descriptionFilterChanged: EventEmitter<any> = new EventEmitter<any>();
  // @ts-ignore
  public selectPlanningsTagsIds$ = this.planningsStore.select(selectPlanningsTagsIds);
  // @ts-ignore
  public selectPlanningsDeviceUserIds$ = this.planningsStore.select(selectPlanningsDeviceUserIds);
  // @ts-ignore
  public selectPlanningsDescriptionFilter$ = this.planningsStore.select(selectPlanningsDescriptionFilter);
  // @ts-ignore
  public selectPlanningsNameFilter$ = this.planningsStore.select(selectPlanningsNameFilter);

  constructor(
    private planningsStore: Store<PlanningsState>,
    public planningsStateService: PlanningsStateService) {}

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
