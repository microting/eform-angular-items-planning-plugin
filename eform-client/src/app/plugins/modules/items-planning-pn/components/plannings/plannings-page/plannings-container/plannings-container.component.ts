import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageSettingsModel } from 'src/app/common/models/settings';

import { SharedPnService } from 'src/app/plugins/modules/shared/services';
import {
  PlanningModel,
  PlanningsModel,
  PlanningsRequestModel,
} from '../../../../models/plannings';
import {
  ItemsPlanningPnPlanningsService,
  ItemsPlanningPnTagsService,
} from '../../../../services';
import { PluginClaimsHelper } from 'src/app/common/helpers';
import { ItemsPlanningPnClaims } from '../../../../enums';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { PlanningTagsComponent } from '../../planning-additions/planning-tags/planning-tags.component';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import {
  CommonDictionaryModel,
  FolderDto,
  SiteNameDto,
} from 'src/app/common/models';
import { FoldersService, SitesService } from 'src/app/common/services/advanced';
import { composeFolderName } from 'src/app/common/helpers/folder-name.helper';
import { AuthService } from 'src/app/common/services';
import * as R from 'ramda';

@AutoUnsubscribe()
@Component({
  selector: 'app-plannings-container',
  templateUrl: './plannings-container.component.html',
  styleUrls: ['./plannings-container.component.scss'],
})
export class PlanningsContainerComponent implements OnInit, OnDestroy {
  @ViewChild('deletePlanningModal', { static: false }) deletePlanningModal;
  @ViewChild('modalCasesColumns', { static: false }) modalCasesColumnsModal;
  @ViewChild('assignSitesModal', { static: false }) assignSitesModal;
  @ViewChild('modalPlanningsImport', { static: false }) modalPlanningsImport;
  @ViewChild('planningTagsModal') planningTagsModal: PlanningTagsComponent;

  descriptionSearchSubject = new Subject();
  nameSearchSubject = new Subject();
  localPageSettings: PageSettingsModel = new PageSettingsModel();
  planningsModel: PlanningsModel = new PlanningsModel();
  planningsRequestModel: PlanningsRequestModel = new PlanningsRequestModel();
  availableTags: CommonDictionaryModel[] = [];
  foldersListDto: FolderDto[] = [];
  sitesDto: SiteNameDto[] = [];

  getPlanningsSub$: Subscription;
  getTagsSub$: Subscription;
  getFoldersListSub$: Subscription;
  getAllSites$: Subscription;
  deletePlanningsSub$: Subscription;
  selectedPlanningsCheckboxes = new Array<{
    planningId: number;
    checked: boolean;
  }>();
  allPlanningsCheckbox = false;

  constructor(
    private sharedPnService: SharedPnService,
    private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService,
    private tagsService: ItemsPlanningPnTagsService,
    private foldersService: FoldersService,
    private sitesService: SitesService,
    private authService: AuthService
  ) {
    this.nameSearchSubject.pipe(debounceTime(500)).subscribe((val) => {
      this.planningsRequestModel.nameFilter = val.toString();
      this.getPlannings();
    });
    this.descriptionSearchSubject.pipe(debounceTime(500)).subscribe((val) => {
      this.planningsRequestModel.descriptionFilter = val.toString();
      this.getPlannings();
    });
  }

  get pluginClaimsHelper() {
    return PluginClaimsHelper;
  }

  get userRole() {
    return this.authService.currentRole;
  }

  get itemsPlanningPnClaims() {
    return ItemsPlanningPnClaims;
  }

  ngOnInit() {
    this.getLocalPageSettings();
    this.getAllInitialData();
  }

  getLocalPageSettings() {
    this.localPageSettings = this.sharedPnService.getLocalPageSettings(
      'itemsPlanningPnSettings',
      'Plannings'
    ).settings;
    this.localPageSettings.additional.forEach((value) => {
      if (value.key === 'tagIds') {
        this.planningsRequestModel.tagIds = JSON.parse(value.value);
      }
    });
  }

  updateLocalPageSettings() {
    const index = this.localPageSettings.additional.findIndex(
      (item) => item.key === 'tagIds'
    );
    if (index !== -1) {
      this.localPageSettings.additional[index].value = JSON.stringify(
        this.planningsRequestModel.tagIds
      );
    } else {
      this.localPageSettings.additional = [
        ...this.localPageSettings.additional,
        {
          key: 'tagIds',
          value: JSON.stringify(this.planningsRequestModel.tagIds),
        },
      ];
    }
    this.sharedPnService.updateLocalPageSettings(
      'itemsPlanningPnSettings',
      this.localPageSettings,
      'Plannings'
    );
    this.getPlannings();
  }

  getAllInitialData() {
    this.getTags();
    this.getAllSites();
    this.loadFoldersAndPlannings();
  }

  getAllSites() {
    this.getAllSites$ = this.sitesService
      .getAllSitesForPairing()
      .subscribe((operation) => {
        if (operation && operation.success) {
          this.sitesDto = operation.model;
        }
      });
  }

  getPlannings() {
    this.planningsRequestModel.isSortDsc = this.localPageSettings.isSortDsc;
    this.planningsRequestModel.sort = this.localPageSettings.sort;
    this.planningsRequestModel.pageSize = this.localPageSettings.pageSize;
    this.getPlanningsSub$ = this.itemsPlanningPnPlanningsService
      .getAllPlannings(this.planningsRequestModel)
      .subscribe((data) => {
        if (data && data.success) {
          // map folder names to items
          if (data.model.total > 0) {
            this.planningsModel = {
              ...data.model,
              plannings: data.model.plannings.map((x) => {
                return {
                  ...x,
                  folder: {
                    ...x.folder,
                    eFormSdkFolderName: composeFolderName(
                      x.folder.eFormSdkFolderId,
                      this.foldersListDto
                    ),
                  },
                };
              }),
            };
          } else {
            this.planningsModel = data.model;
          }
          // Required if page or anything else was changed
          this.resetAllPlanningsCheckboxes();
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

  loadFoldersAndPlannings() {
    this.getFoldersListSub$ = this.foldersService
      .getAllFoldersList()
      .subscribe((operation) => {
        if (operation && operation.success) {
          this.foldersListDto = operation.model;
          this.getPlannings();
        }
      });
  }

  deleteSelectedPlannings() {
    const planningsIds = this.selectedPlanningsCheckboxes.map((x) => {
      return x.planningId;
    });
    this.deletePlanningsSub$ = this.itemsPlanningPnPlanningsService
      .deletePlannings(planningsIds)
      .subscribe((data) => {
        if (data && data.success) {
          // close modal
        }
      });
  }

  showDeletePlanningModal(planning: PlanningModel) {
    this.deletePlanningModal.show(planning);
  }

  openEditColumnsModal(planning: PlanningModel) {
    this.modalCasesColumnsModal.show(planning);
  }

  sortTable(sort: string) {
    if (this.localPageSettings.sort === sort) {
      this.localPageSettings.isSortDsc = !this.localPageSettings.isSortDsc;
    } else {
      this.localPageSettings.isSortDsc = false;
      this.localPageSettings.sort = sort;
    }
    this.updateLocalPageSettings();
  }

  changePage(e: any) {
    if (e || e === 0) {
      this.planningsRequestModel.offset = e;
      if (e === 0) {
        this.planningsRequestModel.pageIndex = 0;
      } else {
        this.planningsRequestModel.pageIndex = Math.floor(
          e / this.planningsRequestModel.pageSize
        );
      }
      this.getPlannings();
    }
  }

  openAssignmentModal(planning: PlanningModel) {
    this.assignSitesModal.show(planning);
  }

  onDescriptionFilterChanged(description: string) {
    this.descriptionSearchSubject.next(description);
  }

  onNameFilterChanged(name: string) {
    this.nameSearchSubject.next(name);
  }

  openTagsModal() {
    this.planningTagsModal.show();
  }

  saveTag(e: any) {
    if (!this.planningsRequestModel.tagIds.find((x) => x === e.id)) {
      this.planningsRequestModel.tagIds.push(e.id);
    }
    this.updateLocalPageSettings();
  }

  removeSavedTag(e: any) {
    this.planningsRequestModel.tagIds = this.planningsRequestModel.tagIds.filter(
      (x) => x !== e.id
    );
    this.updateLocalPageSettings();
  }

  tagSelected(id: number) {
    if (!this.planningsRequestModel.tagIds.find((x) => x === id)) {
      this.planningsRequestModel.tagIds = [
        ...this.planningsRequestModel.tagIds,
        id,
      ];
      this.updateLocalPageSettings();
    }
  }

  ngOnDestroy(): void {}

  openPlanningsImportModal() {
    this.modalPlanningsImport.show();
  }

  onSinglePlanningCheckboxChanged(model: {
    planningId: number;
    checked: boolean;
  }) {
    if (model.checked) {
      this.selectedPlanningsCheckboxes = [
        ...this.selectedPlanningsCheckboxes,
        { ...model },
      ];
    } else {
      const foundObject = this.selectedPlanningsCheckboxes.findIndex(
        (x) => x.planningId === model.planningId
      );
      if (foundObject > -1) {
        this.selectedPlanningsCheckboxes = R.remove(
          foundObject,
          1,
          this.selectedPlanningsCheckboxes
        );
      }
    }
  }

  onAllPlanningsCheckboxChanged(isChecked: boolean) {
    this.allPlanningsCheckbox = isChecked;
    this.selectedPlanningsCheckboxes = [];
    if (isChecked) {
      this.planningsModel.plannings.map((x) => {
        this.selectedPlanningsCheckboxes = [
          ...this.selectedPlanningsCheckboxes,
          { planningId: x.id, checked: true },
        ];
      });
    }
  }

  resetAllPlanningsCheckboxes() {
    this.allPlanningsCheckbox = false;
    this.selectedPlanningsCheckboxes = [];
  }
}
