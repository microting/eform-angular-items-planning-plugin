import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { PlanningModel } from '../../../../../models';
import {
  ItemsPlanningPnPlanningsService,
  ItemsPlanningPnTagsService,
} from '../../../../../services';
import { ItemsPlanningPnClaims } from '../../../../../enums';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import {PlanningsBulkImportModalComponent, PlanningTagsComponent} from '../../planning-additions';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import {
  CommonDictionaryModel,
  FolderDto,
  Paged,
  PaginationModel,
  SiteNameDto,
} from 'src/app/common/models';
import {
  PlanningAssignSitesModalComponent,
  PlanningDeleteComponent,
  PlanningMultipleDeleteComponent
} from '../../../components';
import { FoldersService, SitesService } from 'src/app/common/services';
import {composeFolderName, dialogConfigHelper} from 'src/app/common/helpers';
import { PlanningsStateService } from '../../store';
import { AuthStateService } from 'src/app/common/store';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Overlay} from '@angular/cdk/overlay';
import {selectAuthIsAuth} from 'src/app/state/auth/auth.selector';
import {Store} from '@ngrx/store';

@AutoUnsubscribe()
@Component({
  selector: 'app-plannings-container',
  templateUrl: './plannings-container.component.html',
  styleUrls: ['./plannings-container.component.scss'],
})
export class PlanningsContainerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('modalCasesColumns', { static: false }) modalCasesColumnsModal;
  @ViewChild('planningTagsModal') planningTagsModal: PlanningTagsComponent;

  descriptionSearchSubject = new Subject();
  nameSearchSubject = new Subject();
  planningsModel: Paged<PlanningModel> = new Paged<PlanningModel>();
  availableTags: CommonDictionaryModel[] = [];
  foldersListDto: FolderDto[] = [];
  sitesDto: SiteNameDto[] = [];
  selectedPlanningsCheckboxes: number[] = [];

  getPlanningsSub$: Subscription;
  getTagsSub$: Subscription;
  getFoldersListSub$: Subscription;
  getAllSites$: Subscription;
  deletePlanningsSub$: Subscription;
  deleteMultiplePlanningsSub$: Subscription;
  deletePlanningSub$: Subscription;
  tagsChangedSub$: Subscription;
  importFinishedSub$: Subscription;
  public isAuth$ = this.store.select(selectAuthIsAuth);

  constructor(
    private store: Store,
    private itemsPlanningPnPlanningsService: ItemsPlanningPnPlanningsService,
    private tagsService: ItemsPlanningPnTagsService,
    private foldersService: FoldersService,
    private sitesService: SitesService,
    public planningsStateService: PlanningsStateService,
    public authStateService: AuthStateService,
    public dialog: MatDialog,
    private overlay: Overlay,
  ) {
    this.nameSearchSubject.pipe(debounceTime(500)).subscribe((val) => {
      this.planningsStateService.updateNameFilter(val.toString());
      this.getPlannings();
    });
    this.descriptionSearchSubject.pipe(debounceTime(500)).subscribe((val) => {
      this.planningsStateService.updateDescriptionFilter(val.toString());
      this.getPlannings();
    });
  }

  get itemsPlanningPnClaims() {
    return ItemsPlanningPnClaims;
  }

  ngOnInit() {
    this.getAllInitialData();
  }

  ngAfterViewInit() {
    this.tagsChangedSub$ = this.planningTagsModal.tagsChanged.subscribe(() => {
      this.getTags();
      this.getPlannings();
    });
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
    this.getPlanningsSub$ = this.planningsStateService
      .getAllPlannings()
      .subscribe((data) => {
        if (data && data.success) {
          // map folder names to items
          if (data.model.total > 0) {
            this.planningsModel = {
              ...data.model,
              entities: data.model.entities.map((x) => {
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

  deleteMultiplePlannings(planningMultipleDeleteModal: MatDialogRef<PlanningMultipleDeleteComponent>) {
    this.deletePlanningsSub$ = this.itemsPlanningPnPlanningsService
      .deletePlannings(this.selectedPlanningsCheckboxes)
      .subscribe((data) => {
        if (data && data.success) {
          planningMultipleDeleteModal.close();
          this.getPlannings();
        }
      });
  }

  showDeletePlanningModal(planning: PlanningModel) {
    const planningDeleteModal = this.dialog.open(PlanningDeleteComponent, dialogConfigHelper(this.overlay, planning));
    this.deletePlanningSub$ = planningDeleteModal.componentInstance.planningDeleted.subscribe(_ => this.planningDeleted());
  }

  openEditColumnsModal(planning: PlanningModel) {
    this.modalCasesColumnsModal.show(planning);
  }

  sortTable(sort: string) {
    this.planningsStateService.onSortTable(sort);
    this.getPlannings();
  }

  openAssignmentModal(planning: PlanningModel) {
    const planningAssignSitesModal = this.dialog.open(PlanningAssignSitesModalComponent,
      {...dialogConfigHelper(this.overlay, {sitesDto: this.sitesDto, selectedPlanning: planning}), minWidth: 500});
    this.deletePlanningSub$ = planningAssignSitesModal.componentInstance.sitesAssigned.subscribe(_ => this.getPlannings());
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

  saveDeviceUser(e: any) {
    this.planningsStateService.addOrRemoveDeviceUserIds(e.id);
    this.getPlannings();
  }

  removeSavedDeviceUser(e: any) {
    this.planningsStateService.addOrRemoveDeviceUserIds(e.value.id);
    this.getPlannings();
  }

  deviceUserSelected(id: number) {
    this.planningsStateService.addOrRemoveDeviceUserIds(id);
    this.getPlannings();
  }

  saveTag(e: any) {
    this.planningsStateService.addOrRemoveTagIds(e.id);
    this.getPlannings();
  }

  removeSavedTag(e: any) {
    this.planningsStateService.addOrRemoveTagIds(e.id);
    this.getPlannings();
  }

  tagSelected(id: number) {
    this.planningsStateService.addOrRemoveTagIds(id);
    this.getPlannings();
  }

  openPlanningsImportModal() {
    const importPlanningModal = this.dialog.open(PlanningsBulkImportModalComponent, dialogConfigHelper(this.overlay));
    this.importFinishedSub$ = importPlanningModal.componentInstance.importFinished.subscribe(_ => this.getAllInitialData());
  }

  resetAllPlanningsCheckboxes() {
    this.selectedPlanningsCheckboxes = [];
  }

  showDeleteMultiplePlanningsModal() {
    const planningMultipleDeleteModal = this.dialog
      .open(PlanningMultipleDeleteComponent, dialogConfigHelper(this.overlay, this.selectedPlanningsCheckboxes.length));
    this.deleteMultiplePlanningsSub$ = planningMultipleDeleteModal.componentInstance.deleteMultiplePlannings
      .subscribe(_ => this.deleteMultiplePlannings(planningMultipleDeleteModal));
  }

  planningDeleted() {
    this.planningsStateService.onDelete();
    this.getPlannings();
  }

  onPaginationChanged(paginationModel: PaginationModel) {
    this.planningsStateService.updatePagination(paginationModel);
    this.getPlannings();
  }

  selectedPlanningsChanged(model: number[]) {
    this.selectedPlanningsCheckboxes = model;
  }

  ngOnDestroy(): void {}
}
