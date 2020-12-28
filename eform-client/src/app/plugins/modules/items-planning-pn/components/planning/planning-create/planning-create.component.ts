import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { debounceTime, switchMap } from 'rxjs/operators';
import {
  ItemsPlanningPnPlanningsService,
  ItemsPlanningPnTagsService,
} from '../../../services';
import { EFormService } from 'src/app/common/services/eform';
import { SitesService } from 'src/app/common/services/advanced';
import { AuthService } from 'src/app/common/services';
import { PlanningCreateModel } from '../../../models/plannings';
import {
  TemplateListModel,
  TemplateRequestModel,
} from 'src/app/common/models/eforms';
import { Location } from '@angular/common';
import moment = require('moment');
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Subscription } from 'rxjs';
import { FoldersService } from 'src/app/common/services/advanced/folders.service';
import { FolderDto } from 'src/app/common/models/dto/folder.dto';
import { PlanningFoldersModalComponent } from '../planning-folders-modal/planning-folders-modal.component';
import { CommonDictionaryModel } from 'src/app/common/models';
import {composeFolderName} from 'src/app/common/helpers/folder-name.helper';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {applicationLanguages} from 'src/app/common/const/application-languages.const';

@AutoUnsubscribe()
@Component({
  selector: 'app-planning-create',
  templateUrl: './planning-create.component.html',
  styleUrls: ['./planning-create.component.scss'],
})
export class PlanningCreateComponent implements OnInit, OnDestroy {
  @ViewChild('frame', { static: false }) frame;
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

  selectedFolderName: string;

  get userClaims() {
    return this.authService.userClaims;
  }

  constructor(
    private foldersService: FoldersService,
    private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService,
    private sitesService: SitesService,
    private authService: AuthService,
    private eFormService: EFormService,
    private tagsService: ItemsPlanningPnTagsService,
    private cd: ChangeDetectorRef,
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
  }

  ngOnInit() {
    this.loadFoldersTree();
    this.loadFoldersList();
    this.getTags();
    this.initTranslations();
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
    if (this.newPlanningModel.item.eFormSdkFolderId != null) {
      this.saveButtonDisabled = false;
    }
  }

  goBack() {
    this.location.back();
  }

  getTags() {
    this.getTagsSub$ = this.tagsService.getPlanningsTags().subscribe((data) => {
      if (data && data.success) {
        this.availableTags = data.model;
      }
    });
  }

  createPlanning() {
    if (this.newPlanningModel.internalRepeatUntil) {
      const tempDate = moment(this.newPlanningModel.internalRepeatUntil).format(
        'DD/MM/YYYY'
      );
      const datTime = moment.utc(tempDate, 'DD/MM/YYYY');
      this.newPlanningModel.repeatUntil = datTime.format('YYYY-MM-DD');
    }

    this.createSub$ = this.itemsPlanningPnPlanningsService
      .createPlanning({...this.newPlanningModel, name: this.translationsArray.getRawValue()})
      .subscribe((data) => {
        if (data && data.success) {
          this.location.back();
        }
      });
  }

  show() {
    this.frame.show();
  }

  ngOnDestroy(): void {}

  loadFoldersTree() {
    this.foldersService.getAllFolders().subscribe((operation) => {
      if (operation && operation.success) {
        this.foldersTreeDto = operation.model;
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
    this.foldersModal.show();
  }

  onFolderSelected(folderDto: FolderDto) {
    this.newPlanningModel.item.eFormSdkFolderId = folderDto.id;
    this.selectedFolderName = composeFolderName(
      folderDto.id,
      this.foldersListDto
    );
    this.newPlanningModel.item.eFormSdkFullFolderName = folderDto.parent
        ? `${folderDto.name} - ${folderDto.parent.name}`
        : folderDto.name;
    this.updateSaveButtonDisabled();
  }
}
