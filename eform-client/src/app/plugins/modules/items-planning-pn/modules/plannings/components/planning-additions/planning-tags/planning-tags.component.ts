import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import {
  SharedTagCreateComponent,
  SharedTagDeleteComponent,
  SharedTagEditComponent, SharedTagMultipleCreateComponent,
  SharedTagsComponent
} from 'src/app/common/modules/eform-shared-tags/components';
import {CommonDictionaryModel, SharedTagCreateModel, SharedTagModel, SharedTagMultipleCreateModel,} from 'src/app/common/models';
import {Subscription} from 'rxjs';
import {ItemsPlanningPnTagsService} from '../../../../../services';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Overlay} from '@angular/cdk/overlay';
import {dialogConfigHelper} from 'src/app/common/helpers';

@AutoUnsubscribe()
@Component({
    selector: 'app-planning-tags',
    templateUrl: './planning-tags.component.html',
    styleUrls: ['./planning-tags.component.scss'],
    standalone: false
})
export class PlanningTagsComponent implements OnInit, OnDestroy, OnChanges {
  private tagsService = inject(ItemsPlanningPnTagsService);
  public dialog = inject(MatDialog);
  private overlay = inject(Overlay);

  @Input() availableTags: CommonDictionaryModel[] = [];
  @Output() tagsChanged: EventEmitter<void> = new EventEmitter<void>();
  dialogRef: MatDialogRef<SharedTagsComponent>;
  deleteTag$: Subscription;
  createTag$: Subscription;
  updateTag$: Subscription;
  showCreateTagSub$: Subscription;
  showEditTagSub$: Subscription;
  showDeleteTagSub$: Subscription;
  deletedTagSub$: Subscription;
  updatedTagSub$: Subscription;
  showMultipleTagTagSub$: Subscription;
  createdTagsSub$: Subscription;

  ngOnInit() {
  }

  show(showMultipleCreateBtn: boolean = true) {
    this.dialogRef = this.dialog.open(SharedTagsComponent, dialogConfigHelper(this.overlay, this.availableTags));
    this.dialogRef.componentInstance.showMultipleCreateBtn = showMultipleCreateBtn;
    this.showCreateTagSub$ = this.dialogRef.componentInstance.showCreateTag.subscribe(() => {
      const dialogRefCreateTag = this.dialog.open(SharedTagCreateComponent, dialogConfigHelper(this.overlay));
      this.updatedTagSub$ = dialogRefCreateTag.componentInstance.createdTag.subscribe(tag => this.onTagCreate(tag, dialogRefCreateTag));
    });
    this.showEditTagSub$ = this.dialogRef.componentInstance.showEditTag.subscribe((x) => {
      const dialogRefUpdateTag = this.dialog.open(SharedTagEditComponent, dialogConfigHelper(this.overlay, x));
      this.updatedTagSub$ = dialogRefUpdateTag.componentInstance.updatedTag.subscribe(tag => this.onTagUpdate(tag, dialogRefUpdateTag));
    });
    this.showDeleteTagSub$ = this.dialogRef.componentInstance.showDeleteTag.subscribe((x) => {
      const dialogRefUpdateTag = this.dialog.open(SharedTagDeleteComponent, dialogConfigHelper(this.overlay, x));
      this.deletedTagSub$ = dialogRefUpdateTag.componentInstance.deletedTag.subscribe(tag => this.onTagDelete(tag, dialogRefUpdateTag));
    });
    this.showMultipleTagTagSub$ = this.dialogRef.componentInstance.showMultipleCreateTag.subscribe(() => {
      const dialogRefUpdateTag = this.dialog.open(SharedTagMultipleCreateComponent, {...dialogConfigHelper(this.overlay), minWidth: 500});
      this.createdTagsSub$ = dialogRefUpdateTag.componentInstance.createdTags
        .subscribe(tags => this.onTagsCreate(tags, dialogRefUpdateTag));
    });
  }

  onTagsCreate(tags: SharedTagMultipleCreateModel, dialogRefUpdateTag: MatDialogRef<SharedTagMultipleCreateComponent>): void {
    this.createTag$ = this.tagsService
      .createPlanningTags(tags)
      .subscribe((data) => {
        if (data && data.success) {
          dialogRefUpdateTag.close();
          this.tagsChanged.emit();
        }
      });
    }

  onTagUpdate(model: SharedTagModel, dialogRefUpdateTag: MatDialogRef<SharedTagEditComponent>) {
    this.updateTag$ = this.tagsService
      .updatePlanningTag(model)
      .subscribe((data) => {
        if (data && data.success) {
          dialogRefUpdateTag.close();
          this.tagsChanged.emit();
        }
      });
  }

  onTagCreate(model: SharedTagCreateModel, dialogRefUpdateTag: MatDialogRef<SharedTagCreateComponent>) {
    this.createTag$ = this.tagsService
      .createPlanningTag(model)
      .subscribe((data) => {
        if (data && data.success) {
          dialogRefUpdateTag.close();
          this.tagsChanged.emit();
        }
      });
  }

  onTagDelete(model: SharedTagModel, dialogRefUpdateTag: MatDialogRef<SharedTagDeleteComponent>) {
    this.deleteTag$ = this.tagsService
      .deletePlanningTag(model.id)
      .subscribe((data) => {
        if (data && data.success) {
          dialogRefUpdateTag.close();
          this.tagsChanged.emit();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.availableTags.firstChange && changes.availableTags && this.dialogRef) {
      this.dialogRef.componentInstance.availableTags = changes.availableTags.currentValue;
    }
  }

  ngOnDestroy(): void {}
}
