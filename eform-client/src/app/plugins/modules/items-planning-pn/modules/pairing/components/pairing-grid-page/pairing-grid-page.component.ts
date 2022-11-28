import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  ItemsPlanningPnPairingService,
} from '../../../../services';
import {Subscription} from 'rxjs';
import {CommonDictionaryModel, SiteNameDto} from 'src/app/common/models';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {PairingsModel, PairingUpdateModel} from '../../../../models/pairings';
import * as R from 'ramda';
import {PairingGridUpdateComponent} from '../';
import {PairingStateService} from '../store';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Overlay} from '@angular/cdk/overlay';
import {dialogConfigHelper} from 'src/app/common/helpers';

@AutoUnsubscribe()
@Component({
  selector: 'app-pairing-grid-page',
  templateUrl: './pairing-grid-page.component.html',
  styleUrls: ['./pairing-grid-page.component.scss'],
})
export class PairingGridPageComponent implements OnInit, OnDestroy {
  sitesDto: SiteNameDto[] = [];
  pairings: PairingsModel = new PairingsModel();
  availableTags: CommonDictionaryModel[] = [];
  selectedColCheckboxes = new Array<{ colNumber: number; checked: boolean, siteName: CommonDictionaryModel }>();
  selectedRowCheckboxes = new Array<{ rowNumber: number; checked: boolean, planningId: number }>();
  pairingsForUpdate: PairingUpdateModel[] = [];

  getAllPairings$: Subscription;
  updatePairings$: Subscription;
  updatePairingsSub$: Subscription;

  constructor(
    private pairingService: ItemsPlanningPnPairingService,
    public pairingStateService: PairingStateService,
    public dialog: MatDialog,
    private overlay: Overlay,
  ) {
  }

  ngOnInit(): void {
    this.getAllInitialData();
  }

  getAllInitialData() {
    this.getAllPairings();
  }

  getAllPairings() {
    this.getAllPairings$ = this.pairingStateService
      .getAllPairings()
      .subscribe((operation) => {
        if (operation && operation.success) {
          this.pairings = operation.model;
          this.setSelectedColCheckboxes();
          this.setSelectedRowCheckboxes();
          this.pairingsForUpdate = [];
        }
      });
  }

  updatePairings(updatePairingsModal: MatDialogRef<PairingGridUpdateComponent>) {
    this.updatePairings$ = this.pairingService
      .updatePairings(this.pairingsForUpdate)
      .subscribe((operation) => {
        if (operation && operation.success) {
          updatePairingsModal.close();
          this.getAllPairings();
        }
      });
  }

  ngOnDestroy(): void {
  }

  onPairingChanged(model: PairingUpdateModel) {
    const foundIndexObject = this.pairingsForUpdate.findIndex(
      (x) =>
        x.deviceUserId === model.deviceUserId &&
        x.planningId === model.planningId
    );
    // If pairing found in updates and clicked again - remove from updates
    if (foundIndexObject > -1) {
      // Value does not need to be deleted if the pairing property is equal.
      if (this.pairingsForUpdate[foundIndexObject].paired !== model.paired) {
        this.pairingsForUpdate = R.remove(
          foundIndexObject,
          1,
          this.pairingsForUpdate
        );
      }
    } else {
      // Check whether we need to add an update to the array, because the object may not need to be updated if the same object was passed
      const i = this.pairings.pairings.findIndex(
        (x) =>
          x.planningId === model.planningId &&
          x.pairingValues.findIndex(
            (y) =>
              y.deviceUserId === model.deviceUserId && y.paired !== model.paired
          ) !== -1
      );
      if (i > -1) {
        this.pairingsForUpdate = [...this.pairingsForUpdate, model];
      }
    }
    // Set the checkboxes to true or false, so when you select a row or column, these values will not change automatically
    this.pairings.pairings.forEach((pairing) => {
      if (pairing.planningId === model.planningId) {
        pairing.pairingValues.forEach((pairingValue) => {
          if (pairingValue.deviceUserId === model.deviceUserId) {
            pairingValue.paired = model.paired;
          }
        });
      }
    });
  }

  showUpdatePairingsModal() {
    const updatePairingsModal = this.dialog.open(PairingGridUpdateComponent, dialogConfigHelper(this.overlay, this.pairingsForUpdate));
    this.updatePairingsSub$ = updatePairingsModal.componentInstance.updatePairings.subscribe(_ => this.updatePairings(updatePairingsModal));
  }

  setSelectedColCheckboxes() {
    this.selectedColCheckboxes = this.pairings.deviceUsers.map((x, i) => ({checked: false, colNumber: i, siteName: {...x}}));
  }

  setSelectedRowCheckboxes() {
    this.selectedRowCheckboxes = this.pairings.pairings.map((x, i) => ({checked: false, rowNumber: i, planningId: x.planningId}));
  }

  onFiltersChanged() {
    this.getAllPairings();
  }
}
