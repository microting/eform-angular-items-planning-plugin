import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  ItemsPlanningPnPairingService,
  ItemsPlanningPnPlanningsService, ItemsPlanningPnTagsService,
} from '../../../services';
import { SitesService } from 'src/app/common/services/advanced';
import { Subscription } from 'rxjs';
import {CommonDictionaryModel, SiteNameDto} from 'src/app/common/models';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import {
  PairingUpdateModel,
  PairingsModel,
} from 'src/app/plugins/modules/items-planning-pn/models/pairings';
import * as R from 'ramda';
import {PairingGridUpdateComponent} from '../pairing-grid-update/pairing-grid-update.component';

@AutoUnsubscribe()
@Component({
  selector: 'app-pairing-grid-page',
  templateUrl: './pairing-grid-page.component.html',
  styleUrls: ['./pairing-grid-page.component.scss'],
})
export class PairingGridPageComponent implements OnInit, OnDestroy {
  @ViewChild('updatePairingsModal') updatePairingsModal: PairingGridUpdateComponent;
  getAllSites$: Subscription;
  getAllPairings$: Subscription;
  getTagsSub$: Subscription;
  updatePairings$: Subscription;
  sitesDto: SiteNameDto[] = [];
  pairings: PairingsModel = new PairingsModel();
  availableTags: CommonDictionaryModel[] = [];
  pairingsRequestModal: {tagIds: number[]} = {tagIds: []};

  pairingsForUpdate: PairingUpdateModel[] = [];

  constructor(
    private pairingService: ItemsPlanningPnPairingService,
    private planningService: ItemsPlanningPnPlanningsService,
    private sitesService: SitesService,
    private tagsService: ItemsPlanningPnTagsService
  ) {}

  ngOnInit(): void {
    this.getAllSites();
    this.getAllPairings();
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

  getAllPairings() {
    this.getAllPairings$ = this.pairingService
      .getAllPairings(this.pairingsRequestModal)
      .subscribe((operation) => {
        if (operation && operation.success) {
          this.pairings = operation.model;
        }
      });
  }

  updatePairings() {
    this.updatePairings$ = this.pairingService
      .updatePairings(this.pairingsForUpdate)
      .subscribe((operation) => {
        if (operation && operation.success) {
          this.updatePairingsModal.hide();
        }
      });
  }

  saveTag(e: any) {
    this.pairingsRequestModal.tagIds.push(e.id);
    this.getAllPairings();
  }

  removeSavedTag(e: any) {
    this.pairingsRequestModal.tagIds = this.pairingsRequestModal.tagIds.filter(
      (x) => x !== e.id
    );
    this.getAllPairings();
  }

  ngOnDestroy(): void {}

  onPairingChanged(model: PairingUpdateModel) {
    const foundObject = this.pairingsForUpdate.findIndex(
      (x) =>
        x.deviceUserId === model.deviceUserId &&
        x.planningId === model.planningId
    );
    if (foundObject > -1) {
      // If pairing found in updates and clicked again - remove from updates
      this.pairingsForUpdate = R.remove(foundObject, 1, this.pairingsForUpdate);
    } else {
      this.pairingsForUpdate = [...this.pairingsForUpdate, model];
    }
  }

  showUpdatePairingsModal() {
    this.updatePairingsModal.show(this.pairingsForUpdate);
  }
}
