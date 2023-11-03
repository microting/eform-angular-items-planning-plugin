import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationDataResult } from 'src/app/common/models';
import { PairingsModel } from '../../../../models';
import { ItemsPlanningPnPairingService } from '../../../../services';
import {Store} from '@ngrx/store';
import {ItemsPlanningState} from 'src/app/plugins/modules/items-planning-pn/state/items-planning.state';
import {selectParringsFilters} from 'src/app/plugins/modules/items-planning-pn/state/parring/parring.selector';

@Injectable({ providedIn: 'root' })
export class PairingStateService {
  private selectParringsFilters$ = this.store.select(selectParringsFilters);
  constructor(
    private store: Store<ItemsPlanningState>,
    private service: ItemsPlanningPnPairingService,
  ) {}

  getAllPairings(): Observable<OperationDataResult<PairingsModel>> {
    let requestModel = {
      tagIds: [],
      siteIds: [],
    };
    this.selectParringsFilters$.subscribe((filters) => {
      if (filters === undefined) {
        return;
      }
      requestModel = {
        tagIds: filters.tagIds,
        siteIds: filters.siteIds,
      };
    }).unsubscribe();
    return this.service.getAllPairings(requestModel);
  }
  addOrRemoveTagId(id: number) {
    let currentFilters: any = {};
    this.selectParringsFilters$.subscribe((filters) => {
      if (filters === undefined) {
        return;
      }
      currentFilters = filters;
    }).unsubscribe();
    currentFilters.tagIds = this.arrayToggle(currentFilters.tagIds, id);
    this.store.dispatch({
      type: '[Pairing] Update Pairing Filters',
      payload: {
        filters: currentFilters,
      },
    });
  }

  addOrRemoveSiteIds(id: number) {
    let currentFilters: any = {};
    this.selectParringsFilters$.subscribe((filters) => {
      if (filters === undefined) {
        return;
      }
      currentFilters = filters;
    }).unsubscribe();
    currentFilters.siteIds = this.arrayToggle(currentFilters.siteIds, id);
    this.store.dispatch({
      type: '[Pairing] Update Pairing Filters',
      payload: {
        filters: currentFilters,
      },
    });
  }

  arrayToggle<T>(arr: T[], val: T, forced?: boolean): T[] {
    if (forced && arr.includes(val)) {
      return [...arr];
    } else if (forced === false || arr.includes(val)) {
      return arr.filter((v: typeof val) => v !== val);
    }
    return [...arr, val];
  }
}
