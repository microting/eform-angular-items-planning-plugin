import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ItemsPlanningPnPairingService,
  ItemsPlanningPnPlanningsService,
} from '../../../services';
import { SitesService } from 'src/app/common/services/advanced';
import { Subscription } from 'rxjs';
import { SiteNameDto } from 'src/app/common/models';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import {
  PairingUpdateModel,
  PairingsModel,
} from 'src/app/plugins/modules/items-planning-pn/models/pairings';
import * as R from 'ramda';

@AutoUnsubscribe()
@Component({
  selector: 'app-pairing-grid-page',
  templateUrl: './pairing-grid-page.component.html',
  styleUrls: ['./pairing-grid-page.component.scss'],
})
export class PairingGridPageComponent implements OnInit, OnDestroy {
  getAllSites$: Subscription;
  getAllPairings$: Subscription;
  updatePairings$: Subscription;
  sitesDto: SiteNameDto[] = [];
  pairings: PairingsModel = {
    deviceUsers: ['John jo', 'Jamie', 'Vlad'],
    pairings: [
      {
        planningId: 1,
        planningName: 'Planning 1',
        pairingValues: [
          { deviceUserId: 1, paired: true },
          { deviceUserId: 2, paired: false },
          { deviceUserId: 3, paired: true },
        ],
      },
      {
        planningId: 2,
        planningName: 'Planning 2',
        pairingValues: [
          { deviceUserId: 1, paired: false },
          { deviceUserId: 2, paired: true },
          { deviceUserId: 3, paired: false },
        ],
      },
      {
        planningId: 3,
        planningName: 'Planning 3',
        pairingValues: [
          { deviceUserId: 1, paired: false },
          { deviceUserId: 2, paired: false },
          { deviceUserId: 3, paired: true },
        ],
      },
      {
        planningId: 4,
        planningName: 'Planning 4',
        pairingValues: [
          { deviceUserId: 1, paired: true },
          { deviceUserId: 2, paired: true },
          { deviceUserId: 3, paired: true },
        ],
      },
    ],
  };

  pairingsForUpdate: PairingUpdateModel[] = [];

  constructor(
    private pairingService: ItemsPlanningPnPairingService,
    private planningService: ItemsPlanningPnPlanningsService,
    private sitesService: SitesService
  ) {}

  ngOnInit(): void {
    this.getAllSites();
    // this.getAllPairings();
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

  getAllPairings() {
    this.getAllPairings$ = this.pairingService
      .getAllPairings()
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
        }
      });
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
}
