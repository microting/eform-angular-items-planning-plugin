import {Injectable, inject} from '@angular/core';
import {ItemsPlanningPnPairingService} from '../../../../services';
import {Store} from '@ngrx/store';
import {
  ItemsPlanningState,
  PairingFiltrationState,
  selectPairingsFilters,
  updatePairingFiltersSites,
  updatePairingFiltersTags,
} from '../../../../state';
import {arrayToggle} from 'src/app/common/helpers';

@Injectable({providedIn: 'root'})
export class PairingStateService {
  private store = inject(Store<ItemsPlanningState>);
  private service = inject(ItemsPlanningPnPairingService);

  // @ts-ignore
  private selectPairingsFilters$ = this.store.select(selectPairingsFilters);
  currentFilters: PairingFiltrationState;

  constructor() {
    this.selectPairingsFilters$.subscribe((x) => this.currentFilters = x);
  }

  getAllPairings() {
    return this.service.getAllPairings({tagIds: this.currentFilters.tagIds, siteIds: this.currentFilters.siteIds});
  }

  addOrRemoveTagId(id: number) {
    this.store.dispatch(updatePairingFiltersTags(arrayToggle(this.currentFilters.tagIds, id)));
  }

  addOrRemoveSiteIds(id: number) {
    this.store.dispatch(updatePairingFiltersSites(arrayToggle(this.currentFilters.siteIds, id)));
  }
}
