import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {PairingModel, PairingsModel, PairingUpdateModel} from '../../../../models';
import {AuthStateService} from 'src/app/common/store';
import {CommonDictionaryModel, SiteNameDto} from 'src/app/common/models';
import {PairingStateService} from '../store';
import {SitesService} from 'src/app/common/services';
import {ItemsPlanningPnTagsService} from '../../../../services';
import {Subscription} from 'rxjs';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {MtxGridColumn} from '@ng-matero/extensions/grid';
import {selectAuthIsAuth} from 'src/app/state';
import {Store} from '@ngrx/store';
import {
  selectPairingsSiteIds,
  selectPairingsTagsIds
} from '../../../../state';

@AutoUnsubscribe()
@Component({
    selector: 'app-pairing-grid-table',
    templateUrl: './pairing-grid-table.component.html',
    styleUrls: ['./pairing-grid-table.component.scss'],
    standalone: false
})
export class PairingGridTableComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('firstCellTpl', {static: true}) firstCell!: TemplateRef<any>;
  @ViewChild('otherCellsTpl', {static: true}) otherCellsTpl!: TemplateRef<any>;
  @Input() pairingsModel: PairingsModel;
  @Output() pairingChanged = new EventEmitter<PairingUpdateModel>();
  @Output() changedFilters = new EventEmitter<void>();
  @Input() selectedColCheckboxes: Array<{ colNumber: number, checked: boolean, siteName: CommonDictionaryModel }>;
  @Input() selectedRowCheckboxes: Array<{ rowNumber: number, checked: boolean, planningId: number }>;
  availableTags: CommonDictionaryModel[] = [];
  sitesDto: SiteNameDto[] = [];
  getAllSites$: Subscription;
  getTagsSub$: Subscription;

  public tableHeaders: MtxGridColumn[] = [];
  public isAuth$ = this.store.select(selectAuthIsAuth);
  public selectPairingsTagsIds$ = this.itemsPlanningStore.select(selectPairingsTagsIds);
  public selectPairingsSiteIds$ = this.itemsPlanningStore.select(selectPairingsSiteIds);

  constructor(
    private store: Store,
    private itemsPlanningStore: Store,
    public authStateService: AuthStateService,
    public pairingStateService: PairingStateService,
    private sitesService: SitesService,
    private tagsService: ItemsPlanningPnTagsService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.pairingsModel && !changes.pairingsModel.isFirstChange()) {
      this.pairingsModel.pairings = this.pairingsModel.pairings.map((x) => ({
        pairingValues: x.pairingValues.map((y) => {
          y.deviceUserName = this.pairingsModel.deviceUsers.find(z => z.id === y.deviceUserId)?.name;
          return y;
        }),
        ...x,
      }));
      this.tableHeaders = [];
      this.tableHeaders = [
        {field: 'firstCell', header: '', cellTemplate: this.firstCell}, // row select
        ...(this.pairingsModel.deviceUsers.map((x, i) => ({
          field: x.id.toString(),
          header: x.name,
          cellTemplate: this.otherCellsTpl,
          index: i,
        }))),
      ];
    }
  }

  ngOnInit(): void {
    this.getAllSites();
    this.getTags();
  }

  checked(e: boolean, planningId: number, deviceUserId: number) {
    this.pairingChanged.emit({
      paired: e,
      planningId,
      deviceUserId,
    });
  }

  selectDeviceUserColumn($event: boolean, siteId: string) {
    const index = this.selectedColCheckboxes.findIndex(x => x.siteName.id === +siteId);
    if (index !== -1) {
      this.selectedColCheckboxes[index].checked = $event;
      this.pairingsModel.pairings.forEach(pairing =>
        this.checked($event, pairing.planningId, pairing.pairingValues[index].deviceUserId));
    }
  }

  selectPlanningRow($event: boolean, planningId: number) {
    const index = this.selectedRowCheckboxes.findIndex(x => x.planningId === planningId);
    if (index !== -1) {
      this.selectedRowCheckboxes[index].checked = $event;
      this.pairingsModel.pairings[index].pairingValues.forEach(pairingValue =>
        this.checked($event, this.pairingsModel.pairings[index].planningId, pairingValue.deviceUserId));
    }
  }

  saveTag(e: CommonDictionaryModel) {
    this.pairingStateService.addOrRemoveTagId(e.id);
    this.changedFilters.emit();
  }

  removeSavedTag(e: CommonDictionaryModel) {
    this.pairingStateService.addOrRemoveTagId(e.id);
    this.changedFilters.emit();
  }

  saveSite(e: CommonDictionaryModel) {
    this.pairingStateService.addOrRemoveSiteIds(e.id);
    this.changedFilters.emit();
  }

  removeSavedSite(e: CommonDictionaryModel) {
    this.pairingStateService.addOrRemoveSiteIds(e.id);
    this.changedFilters.emit();
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

  getTags() {
    this.getTagsSub$ = this.tagsService.getPlanningsTags().subscribe((data) => {
      if (data && data.success) {
        this.availableTags = data.model;
      }
    });
  }

  getIsPaired(pairingModel: PairingModel, colField: string) {
    const pairingValue = this.getPairingValueByIndex(pairingModel, colField);
    if (pairingValue) {
      return pairingValue.paired;
    }
    return false;
  }

  getPairingValueByIndex(pairingModel: PairingModel, colField: string) {
    const index = this.pairingsModel.deviceUsers.findIndex(x => x.id === +colField);
    if (index !== -1) {
      const userId = this.pairingsModel.deviceUsers[index].id;
      return pairingModel.pairingValues.find(x => x.deviceUserId === userId);
    }
  }

  getLatestCaseStatus(pairingModel: PairingModel, colField: string) {
    const pairingValue = this.getPairingValueByIndex(pairingModel, colField);
    if (pairingValue) {
      return pairingValue.latestCaseStatus;
    }
    return null;
  }

  getPairingByIndex(index: number) {
    return this.pairingsModel.pairings[index];
  }

  getTextAfterCheckbox(pairingModel: PairingModel, colField: string) {
    const pairingValue = this.getPairingValueByIndex(pairingModel, colField);
    return `(${pairingValue.deviceUserId}${pairingValue.planningCaseSiteId ? '/' + pairingValue.planningCaseSiteId : ''})`;
  }

  getIsSelectedColCheckboxByIndex(siteId: string): boolean {
    const index = this.selectedColCheckboxes.findIndex(x => x.siteName.id === +siteId);
    if (index !== -1) {
      return this.selectedColCheckboxes[index].checked;
    }
    return false;
  }

  getIsSelectedRowCheckboxByIndex(planningId: number) {
    const index = this.selectedRowCheckboxes.findIndex(x => x.planningId === planningId);
    if (index !== -1) {
      return this.selectedRowCheckboxes[index].checked;
    }
    return false;
  }

  ngOnDestroy(): void {
  }
}
