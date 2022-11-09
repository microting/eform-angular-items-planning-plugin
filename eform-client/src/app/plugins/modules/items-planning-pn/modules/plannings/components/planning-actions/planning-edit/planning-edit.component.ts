import {
  ItemsPlanningPnPlanningsService,
  ItemsPlanningPnTagsService,
} from '../../../../../services';
import {
  CommonDictionaryModel,
  CommonTranslationModel,
  FolderDto,
  TemplateListModel,
  TemplateRequestModel,
} from 'src/app/common/models';
import { EFormService, FoldersService } from 'src/app/common/services';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Location } from '@angular/common';
import { debounceTime, switchMap } from 'rxjs/operators';
import { PlanningModel, PlanningUpdateModel } from '../../../../../models';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { composeFolderName } from 'src/app/common/helpers';
import { format, set } from 'date-fns';
import {PlanningFoldersModalComponent} from '../../';

@AutoUnsubscribe()
@Component({
  selector: 'app-planning-edit',
  templateUrl: './planning-edit.component.html',
  styleUrls: ['./planning-edit.component.scss'],
})
export class PlanningEditComponent implements OnInit, OnDestroy {
  @ViewChild('frame', { static: false }) frame;
  @ViewChild('unitImportModal', { static: false }) importUnitModal;
  @ViewChild('foldersModal', { static: false })
  foldersModal: PlanningFoldersModalComponent;
  @Output() planningUpdated: EventEmitter<void> = new EventEmitter<void>();
  selectedPlanningModel: PlanningModel = new PlanningModel();
  templateRequestModel: TemplateRequestModel = new TemplateRequestModel();
  templatesModel: TemplateListModel = new TemplateListModel();
  typeahead = new EventEmitter<string>();
  selectedPlanningId: number;
  foldersTreeDto: FolderDto[] = [];
  foldersListDto: FolderDto[] = [];
  availableTags: CommonDictionaryModel[] = [];
  saveButtonDisabled = true;
  translationsArray: FormArray = new FormArray([]);

  getTagsSub$: Subscription;
  getItemsPlanningSub$: Subscription;
  getFoldersTreeSub$: Subscription;
  getFoldersListSub$: Subscription;
  activatedRouteSub$: Subscription;

  selectedFolderName: string;
  daysBeforeRedeploymentPushMessage = Array(28)
    .fill(0)
    .map((_e, i) => i);

  constructor(
    private foldersService: FoldersService,
    private activateRoute: ActivatedRoute,
    private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService,
    private cd: ChangeDetectorRef,
    private tagsService: ItemsPlanningPnTagsService,
    private eFormService: EFormService,
    private location: Location
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
    this.activatedRouteSub$ = this.activateRoute.params.subscribe((params) => {
      this.selectedPlanningId = +params['id'];
    });
  }

  ngOnInit() {
    this.getSelectedPlanning(this.selectedPlanningId);
    this.getTags();
  }

  updateSaveButtonDisabled() {
    if (this.selectedPlanningModel.folder.eFormSdkFolderId != null) {
      this.saveButtonDisabled = false;
    }
  }

  initTranslations(translations: CommonTranslationModel[]) {
    for (const translation of translations) {
      this.translationsArray.push(
        new FormGroup({
          id: new FormControl(translation.id),
          name: new FormControl(translation.name),
          localeName: new FormControl(translation.localeName),
          language: new FormControl(translation.language),
        })
      );
    }
  }

  getSelectedPlanning(id: number) {
    this.getItemsPlanningSub$ = this.itemsPlanningPnPlanningsService
      .getSinglePlanning(id)
      .subscribe((data) => {
        if (data && data.success) {
          this.selectedPlanningModel = {
            ...data.model,
            reiteration: {
              ...data.model.reiteration,
              internalRepeatUntil: data.model.reiteration.repeatUntil,
            },
            boundEform: {
              ...data.model.boundEform,
              currentRelatedEformId: data.model.boundEform.relatedEFormId,
            },
          };
          this.selectedPlanningModel.reiteration.internalRepeatUntil = this.selectedPlanningModel.reiteration.repeatUntil;
          this.loadFoldersTree();
          this.loadFoldersList();
          this.initTranslations(data.model.translationsName);
          this.templatesModel.templates = [
            {
              id: this.selectedPlanningModel.boundEform.relatedEFormId,
              label: this.selectedPlanningModel.boundEform.relatedEFormName,
            } as any,
          ];
        }
      });
  }

  getTags() {
    this.getTagsSub$ = this.tagsService.getPlanningsTags().subscribe((data) => {
      if (data && data.success) {
        this.availableTags = data.model;
      }
    });
  }

  goBack() {
    this.location.back();
  }

  updatePlanning() {
    const model = {
      ...this.selectedPlanningModel,
      translationsName: this.translationsArray.getRawValue(),
    } as PlanningUpdateModel;
    this.itemsPlanningPnPlanningsService
      .updatePlanning(model)
      .subscribe((data) => {
        if (data && data.success) {
          this.planningUpdated.emit();
          this.selectedPlanningModel = new PlanningModel();
          this.goBack();
        }
      });
  }

  loadFoldersTree() {
    this.getFoldersTreeSub$ = this.foldersService
      .getAllFolders()
      .subscribe((operation) => {
        if (operation && operation.success) {
          this.foldersTreeDto = operation.model;
          if (this.selectedPlanningModel.folder.eFormSdkFolderId != null) {
            this.saveButtonDisabled = false;
          }
        }
      });
  }

  loadFoldersList() {
    this.getFoldersListSub$ = this.foldersService
      .getAllFoldersList()
      .subscribe((operation) => {
        if (operation && operation.success) {
          this.foldersListDto = operation.model;
          this.selectedFolderName = composeFolderName(
            this.selectedPlanningModel.folder.eFormSdkFolderId,
            this.foldersListDto
          );
        }
      });
  }

  openFoldersModal() {
    this.foldersModal.show(this.selectedPlanningModel);
  }

  onFolderSelected(folderDto: FolderDto) {
    this.selectedPlanningModel.folder.eFormSdkFolderId = folderDto.id;
    this.selectedFolderName = composeFolderName(
      folderDto.id,
      this.foldersListDto
    );
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
    this.selectedPlanningModel.reiteration.startDate = format(
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
    this.selectedPlanningModel.reiteration.repeatUntil = format(
      date,
      `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`
    );
  }

  ngOnDestroy(): void {}
}
