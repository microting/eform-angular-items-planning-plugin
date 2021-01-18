import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ItemsPlanningPnPlanningsService,
  ItemsPlanningPnTagsService,
} from 'src/app/plugins/modules/items-planning-pn/services';
import {
  PlanningPnModel,
  PlanningUpdateModel,
} from '../../../models/plannings';
import {
  TemplateListModel,
  TemplateRequestModel,
} from '../../../../../../common/models/eforms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { EFormService } from 'src/app/common/services/eform';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FolderDto } from 'src/app/common/models/dto/folder.dto';
import { FoldersService } from 'src/app/common/services/advanced/folders.service';
import { PlanningFoldersModalComponent } from '../planning-folders-modal/planning-folders-modal.component';
import {
  CommonDictionaryModel,
  CommonTranslationModel,
} from 'src/app/common/models';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Subscription } from 'rxjs';
import { composeFolderName } from 'src/app/common/helpers/folder-name.helper';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { applicationLanguages } from 'src/app/common/const/application-languages.const';

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
  selectedPlanningModel: PlanningPnModel = new PlanningPnModel();
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

  selectedFolderName: string;

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
    const activatedRouteSub = this.activateRoute.params.subscribe((params) => {
      this.selectedPlanningId = +params['id'];
    });
  }

  ngOnInit() {
    this.getSelectedPlanning(this.selectedPlanningId);
    this.getTags();
  }

  updateSaveButtonDisabled() {
    if (this.selectedPlanningModel.item.eFormSdkFolderId != null) {
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
            internalRepeatUntil: data.model.repeatUntil,
            currentRelatedEformId: data.model.relatedEFormId,
          };
          this.selectedPlanningModel.internalRepeatUntil = this.selectedPlanningModel.repeatUntil;
          this.loadFoldersTree();
          this.loadFoldersList();
          this.initTranslations(data.model.translationsName);
          this.templatesModel.templates = [
            {
              id: this.selectedPlanningModel.relatedEFormId,
              label: this.selectedPlanningModel.relatedEFormName,
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
    if (this.selectedPlanningModel.internalRepeatUntil) {
      this.selectedPlanningModel.repeatUntil = moment(
        this.selectedPlanningModel.internalRepeatUntil
      ).format('YYYY-MM-DDT00:00:00');
    }
    if (this.selectedPlanningModel.startDate) {
      this.selectedPlanningModel.startDate = moment(
        this.selectedPlanningModel.startDate
      ).format('YYYY-MM-DDT00:00:00');
    }
    const model = {
      ...this.selectedPlanningModel,
      translationsName: this.translationsArray.getRawValue(),
    } as PlanningUpdateModel;
    this.itemsPlanningPnPlanningsService
      .updatePlanning(model)
      .subscribe((data) => {
        if (data && data.success) {
          this.planningUpdated.emit();
          this.selectedPlanningModel = new PlanningPnModel();
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
          if (this.selectedPlanningModel.item.eFormSdkFolderId != null) {
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
            this.selectedPlanningModel.item.eFormSdkFolderId,
            this.foldersListDto
          );
        }
      });
  }

  openFoldersModal() {
    this.foldersModal.show(this.selectedPlanningModel);
  }

  onFolderSelected(folderDto: FolderDto) {
    this.selectedPlanningModel.item.eFormSdkFolderId = folderDto.id;
    this.selectedFolderName = composeFolderName(
      folderDto.id,
      this.foldersListDto
    );
    this.updateSaveButtonDisabled();
  }

  ngOnDestroy(): void {}
}
