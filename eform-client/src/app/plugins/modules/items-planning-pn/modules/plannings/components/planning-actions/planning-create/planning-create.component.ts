import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {debounceTime, switchMap} from 'rxjs/operators';
import {
  ItemsPlanningPnPlanningsService,
  ItemsPlanningPnTagsService,
} from '../../../../../services';
import {PlanningCreateModel} from '../../../../../models';
import {Location} from '@angular/common';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {Subscription, take} from 'rxjs';
import {PlanningFoldersModalComponent} from '../../planning-additions';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {AuthStateService} from 'src/app/common/store';
import {applicationLanguagesTranslated, PARSING_DATE_FORMAT} from 'src/app/common/const';
import {composeFolderName, dialogConfigHelper} from 'src/app/common/helpers';
import {
  SitesService,
  EFormService,
  FoldersService,
} from 'src/app/common/services';
import {
  TemplateListModel,
  TemplateRequestModel,
  CommonDictionaryModel,
  FolderDto,
} from 'src/app/common/models';
import {format, set} from 'date-fns';
import {MatDialog} from '@angular/material/dialog';
import {Overlay} from '@angular/cdk/overlay';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';

@AutoUnsubscribe()
@Component({
  selector: 'app-planning-create',
  templateUrl: './planning-create.component.html',
  styleUrls: ['./planning-create.component.scss'],
})
export class PlanningCreateComponent implements OnInit, OnDestroy {
  typeahead = new EventEmitter<string>();
  newPlanningModel: PlanningCreateModel = new PlanningCreateModel();
  templateRequestModel: TemplateRequestModel = new TemplateRequestModel();
  templatesModel: TemplateListModel = new TemplateListModel();
  createSub$: Subscription;
  getTagsSub$: Subscription;
  getFoldersListSub$: Subscription;
  foldersTreeDto: FolderDto[] = [];
  foldersListDto: FolderDto[] = [];
  saveButtonDisabled = true;
  availableTags: CommonDictionaryModel[] = [];
  translationsArray: FormArray = new FormArray([]);
  daysBeforeRedeploymentPushMessage = Array(27)
    .fill(0)
    .map((_e, i) => i);

  selectedFolderName: string;
  folderSelectedSub$: Subscription;

  get userClaims() {
    return this.authStateService.currentUserClaims;
  }

  constructor(
    private foldersService: FoldersService,
    private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService,
    private sitesService: SitesService,
    private eFormService: EFormService,
    private tagsService: ItemsPlanningPnTagsService,
    private cd: ChangeDetectorRef,
    private location: Location,
    private authStateService: AuthStateService,
    public dialog: MatDialog,
    private overlay: Overlay,
  ) {
    this.typeahead
      .pipe(
        debounceTime(200),
        switchMap((term) => {
          this.templateRequestModel.nameFilter = term;
          return this.eFormService.getAll(this.templateRequestModel);
        })
      )
      .subscribe((items) => {
        this.templatesModel = items.model;
        this.cd.markForCheck();
      });
  }

  ngOnInit() {
    this.loadFoldersTree();
    this.getTags();
    this.initTranslations();
  }

  goBack() {
    this.location.back();
  }

  initTranslations() {
    for (const language of applicationLanguagesTranslated) {
      this.translationsArray.push(
        new FormGroup({
          id: new FormControl(language.id),
          name: new FormControl(),
          localeName: new FormControl(language.locale),
          language: new FormControl(language.text),
        })
      );
    }
  }

  updateSaveButtonDisabled() {
    if (this.newPlanningModel.folder.eFormSdkFolderId != null) {
      this.saveButtonDisabled = false;
    }
  }

  getTags() {
    this.getTagsSub$ = this.tagsService.getPlanningsTags().subscribe((data) => {
      if (data && data.success) {
        this.availableTags = data.model;
      }
    });
  }

  createPlanning() {
    this.createSub$ = this.itemsPlanningPnPlanningsService
      .createPlanning({
        ...this.newPlanningModel,
        translationsName: this.translationsArray.getRawValue(),
        reiteration: {
          ...this.newPlanningModel.reiteration,
          startDate: this.newPlanningModel.reiteration.startDate &&
            format(this.newPlanningModel.reiteration.startDate as Date, PARSING_DATE_FORMAT),
          repeatUntil: this.newPlanningModel.reiteration.internalRepeatUntil &&
            format(this.newPlanningModel.reiteration.internalRepeatUntil as Date, PARSING_DATE_FORMAT),
        }
      })
      .subscribe((data) => {
        if (data && data.success) {
          this.location.back();
        }
      });
  }

  ngOnDestroy(): void {
  }

  loadFoldersTree() {
    this.foldersService.getAllFolders().subscribe((operation) => {
      if (operation && operation.success) {
        this.foldersTreeDto = operation.model;
        this.loadFoldersList();
      }
    });
  }

  loadFoldersList() {
    this.getFoldersListSub$ = this.foldersService
      .getAllFoldersList()
      .subscribe((operation) => {
        if (operation && operation.success) {
          this.foldersListDto = operation.model;
        }
      });
  }

  openFoldersModal() {
    const foldersModal = this.dialog.open(PlanningFoldersModalComponent,
      {...dialogConfigHelper(this.overlay, {folders: this.foldersTreeDto, planningModel: this.newPlanningModel}), hasBackdrop: true});
    foldersModal.backdropClick().pipe(take(1)).subscribe(_ => foldersModal.close());
    this.folderSelectedSub$ = foldersModal.componentInstance.folderSelected.subscribe(x => this.onFolderSelected(x));
  }

  onFolderSelected(folderDto: FolderDto) {
    this.newPlanningModel.folder.eFormSdkFolderId = folderDto.id;
    this.selectedFolderName = composeFolderName(
      folderDto.id,
      this.foldersListDto
    );
    this.newPlanningModel.folder.eFormSdkFullFolderName = folderDto.parent
      ? `${folderDto.name} - ${folderDto.parent.name}`
      : folderDto.name;
    this.updateSaveButtonDisabled();
  }

  updateStartDate(e: MatDatepickerInputEvent<any, any>) {
    let date = new Date(e.value);
    date = set(date, {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
      date: date.getDate(),
      year: date.getFullYear(),
      month: date.getMonth(),
    });
    this.newPlanningModel.reiteration.startDate = date;
  }

  updateEndDate(e: MatDatepickerInputEvent<any, any>) {
    let date = new Date(e.value);
    date = set(date, {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
      date: date.getDate(),
      year: date.getFullYear(),
      month: date.getMonth(),
    });
    this.newPlanningModel.reiteration.internalRepeatUntil = date;
  }
}
