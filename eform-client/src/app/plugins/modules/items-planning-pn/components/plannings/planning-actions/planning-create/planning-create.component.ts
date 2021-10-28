import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { debounceTime, switchMap } from 'rxjs/operators';
import {
  ItemsPlanningPnPlanningsService,
  ItemsPlanningPnTagsService,
} from '../../../../services';
import { PlanningCreateModel } from '../../../../models/plannings';
import { Location } from '@angular/common';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Subscription } from 'rxjs';
import { PlanningFoldersModalComponent } from '../../planning-additions';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { AuthStateService } from 'src/app/common/store';
import { applicationLanguages } from 'src/app/common/const';
import { composeFolderName } from 'src/app/common/helpers';
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
import { format, set } from 'date-fns';

@AutoUnsubscribe()
@Component({
  selector: 'app-planning-create',
  templateUrl: './planning-create.component.html',
  styleUrls: ['./planning-create.component.scss'],
})
export class PlanningCreateComponent implements OnInit, OnDestroy {
  @ViewChild('foldersModal', { static: false })
  foldersModal: PlanningFoldersModalComponent;
  newPlanningModel: PlanningCreateModel = new PlanningCreateModel();
  templateRequestModel: TemplateRequestModel = new TemplateRequestModel();
  templatesModel: TemplateListModel = new TemplateListModel();
  typeahead = new EventEmitter<string>();
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
    private authStateService: AuthStateService
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
  }

  goBack() {
    this.location.back();
  }

  initTranslations() {
    for (const language of applicationLanguages) {
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
        this.initTranslations();
      }
    });
  }

  createPlanning() {
    this.createSub$ = this.itemsPlanningPnPlanningsService
      .createPlanning({
        ...this.newPlanningModel,
        translationsName: this.translationsArray.getRawValue(),
      })
      .subscribe((data) => {
        if (data && data.success) {
          this.location.back();
        }
      });
  }

  ngOnDestroy(): void {}

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
          this.getTags();
        }
      });
  }

  openFoldersModal() {
    this.foldersModal.show();
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

  updateStartDate(e: any) {
    let date = new Date(e);
    date = set(date, {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    this.newPlanningModel.reiteration.startDate = format(
      date,
      `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`
    );
  }

  updateEndDate(e: any) {
    let date = new Date(e);
    date = set(date, {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    this.newPlanningModel.reiteration.repeatUntil = format(
      date,
      `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`
    );
  }
}
