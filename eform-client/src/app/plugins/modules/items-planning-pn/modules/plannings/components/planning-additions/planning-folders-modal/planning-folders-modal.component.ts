import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FolderDto, SiteNameDto } from 'src/app/common/models';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { PlanningModel } from '../../../../../models';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@AutoUnsubscribe()
@Component({
    selector: 'app-planning-folders-modal',
    templateUrl: './planning-folders-modal.component.html',
    styleUrls: ['./planning-folders-modal.component.scss'],
    standalone: false
})
export class PlanningFoldersModalComponent implements OnInit, OnDestroy {
  folderSelected: EventEmitter<FolderDto> = new EventEmitter<FolderDto>();
  selectedPlanning: PlanningModel = new PlanningModel();
  sitesDto: Array<SiteNameDto> = [];
  folders: FolderDto[] = [];

  constructor(
    public dialogRef: MatDialogRef<PlanningFoldersModalComponent>,
    @Inject(MAT_DIALOG_DATA) model: {folders: FolderDto[], planningModel?: PlanningModel}) {
    this.selectedPlanning = model.planningModel;
    this.folders = model.folders;
  }

  ngOnInit() {}

  select(folder: FolderDto) {
    this.folderSelected.emit(folder);
    this.dialogRef.close();
  }

  ngOnDestroy(): void {}
}
