import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import {MatDialogTitle, MatDialogContent} from '@angular/material/dialog';
import {MatCard, MatCardContent} from '@angular/material/card';
import {EformTreeViewPickerComponent} from 'src/app/common/modules/eform-shared/components';
import {TranslatePipe} from '@ngx-translate/core';
import { FolderDto, SiteNameDto } from 'src/app/common/models';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { PlanningModel } from '../../../../../models';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@AutoUnsubscribe()
@Component({
    selector: 'app-planning-folders-modal',
    templateUrl: './planning-folders-modal.component.html',
    styleUrls: ['./planning-folders-modal.component.scss'],
    imports: [MatDialogTitle, MatDialogContent, MatCard, MatCardContent, EformTreeViewPickerComponent, TranslatePipe]
})
export class PlanningFoldersModalComponent implements OnInit, OnDestroy {
  public dialogRef = inject(MatDialogRef<PlanningFoldersModalComponent>);
  private model = inject<{folders: FolderDto[], planningModel?: PlanningModel}>(MAT_DIALOG_DATA);

  folderSelected: EventEmitter<FolderDto> = new EventEmitter<FolderDto>();
  selectedPlanning: PlanningModel = new PlanningModel();
  sitesDto: Array<SiteNameDto> = [];
  folders: FolderDto[] = [];

  constructor() {
    this.selectedPlanning = this.model.planningModel;
    this.folders = this.model.folders;
  }

  ngOnInit() {}

  select(folder: FolderDto) {
    this.folderSelected.emit(folder);
    this.dialogRef.close();
  }

  ngOnDestroy(): void {}
}
