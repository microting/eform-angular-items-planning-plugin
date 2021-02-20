import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonDictionaryModel} from 'src/app/common/models';
import {PlanningsRequestModel} from '../../../../models/plannings';

@Component({
  selector: 'app-plannings-header',
  templateUrl: './plannings-header.component.html',
  styleUrls: ['./plannings-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningsHeaderComponent implements OnInit {
  @Input() availableTags: CommonDictionaryModel[] = [];
  @Input() planningsRequestModel: PlanningsRequestModel = new PlanningsRequestModel();
  @Output() tagSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() savedTagRemoved: EventEmitter<any> = new EventEmitter<any>();
  @Output() nameFilterChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() descriptionFilterChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  saveTag(e: any) {
    this.tagSaved.emit(e);
  }

  removeSavedTag(e: any) {
    this.savedTagRemoved.emit(e);
  }

  onNameFilterChanged(value: any) {
    this.nameFilterChanged.emit(value);
  }

  onDescriptionFilterChanged(value: any) {
    this.descriptionFilterChanged.emit(value);
  }
}
