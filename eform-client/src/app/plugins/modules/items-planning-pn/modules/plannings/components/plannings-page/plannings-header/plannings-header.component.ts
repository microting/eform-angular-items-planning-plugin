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

  constructor(public planningsStateService: PlanningsStateService) {}

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
