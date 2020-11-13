import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageSettingsModel } from 'src/app/common/models/settings';

import { SharedPnService } from 'src/app/plugins/modules/shared/services';
import {
  PlanningPnModel,
  PlanningsRequestModel,
  PlanningsPnModel,
} from '../../../models/plannings';
import {
  ItemsPlanningPnPlanningsService,
  ItemsPlanningPnTagsService,
} from '../../../services';
import { PluginClaimsHelper } from 'src/app/common/helpers';
import { ItemsPlanningPnClaims } from '../../../enums';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { PlanningTagsComponent } from '../planning-tags/planning-tags.component';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import {CommonDictionaryModel, FolderDto, SiteDto, SiteNameDto} from 'src/app/common/models';
import {FoldersService, SitesService} from 'src/app/common/services/advanced';
import { composeFolderName } from 'src/app/common/helpers/folder-name.helper';

@AutoUnsubscribe()
@Component({
  selector: 'app-plannings-page',
  templateUrl: './plannings-page.component.html',
  styleUrls: ['./plannings-page.component.scss'],
})
export class PlanningsPageComponent implements OnInit, OnDestroy {
  @ViewChild('deletePlanningModal', { static: false }) deletePlanningModal;
  @ViewChild('modalCasesColumns', { static: false }) modalCasesColumnsModal;
  @ViewChild('assignSitesModal', { static: false }) assignSitesModal;
  @ViewChild('planningTagsModal') planningTagsModal: PlanningTagsComponent;

  descriptionSearchSubject = new Subject();
  nameSearchSubject = new Subject();
  localPageSettings: PageSettingsModel = new PageSettingsModel();
  planningsModel: PlanningsPnModel = new PlanningsPnModel();
  planningsRequestModel: PlanningsRequestModel = new PlanningsRequestModel();
  availableTags: CommonDictionaryModel[] = [];
  foldersListDto: FolderDto[] = [];
  sitesDto: SiteNameDto[] = [];

  getPlanningsSub$: Subscription;
  getTagsSub$: Subscription;
  getFoldersListSub$: Subscription;
  getAllSites$: Subscription;

  constructor(
    private sharedPnService: SharedPnService,
    private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService,
    private tagsService: ItemsPlanningPnTagsService,
    private foldersService: FoldersService,
    private sitesService: SitesService
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

  get itemsPlanningPnClaims() {
    return ItemsPlanningPnClaims;
  }

  ngOnInit() {
    this.getLocalPageSettings();
  }

  getLocalPageSettings() {
    this.localPageSettings = this.sharedPnService.getLocalPageSettings(
      'itemsPlanningPnSettings',
      'Plannings'
    ).settings;
    this.getAllInitialData();
  }

  updateLocalPageSettings() {
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
                  item: {
                    // return same item with different folder name
                    ...x.item,
                    eFormSdkFolderName: composeFolderName(x.item.eFormSdkFolderId, this.foldersListDto)
                  },
                };
              }),
            };
          } else {
            this.planningsModel = data.model;
          }
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

  showDeletePlanningModal(planning: PlanningPnModel) {
    this.deletePlanningModal.show(planning);
  }

  openEditColumnsModal(planning: PlanningPnModel) {
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

  openAssignmentModal(planning: PlanningPnModel) {
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
    this.planningsRequestModel.tagIds.push(e.id);
    this.getPlannings();
  }

  removeSavedTag(e: any) {
    this.planningsRequestModel.tagIds = this.planningsRequestModel.tagIds.filter(
      (x) => x !== e.id
    );
    this.getPlannings();
  }

  tagSelected(id: number) {
    if (!this.planningsRequestModel.tagIds.find((x) => x === id)) {
      this.planningsRequestModel.tagIds = [
        ...this.planningsRequestModel.tagIds,
        id,
      ];
      this.getPlannings();
    }
  }

  ngOnDestroy(): void {}
}
