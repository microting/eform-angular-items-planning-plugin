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
  // @ts-ignore
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
    let tagIds: any = {};
    this.selectParringsFilters$.subscribe((filters) => {
      if (filters === undefined) {
        return;
      }
      tagIds = filters.tagIds;
    }).unsubscribe();
    tagIds = this.arrayToggle(tagIds, id);
    this.store.dispatch({
      type: '[Pairing] Update Pairing TagIds',
      payload: {
        filters: {
          tagIds: tagIds,
        }
      },
    });
  }

  addOrRemoveSiteIds(id: number) {
    let siteIds: any = {};
    this.selectParringsFilters$.subscribe((filters) => {
      if (filters === undefined) {
        return;
      }
      siteIds = filters.siteIds;
    }).unsubscribe();
    siteIds = this.arrayToggle(siteIds, id);
    this.store.dispatch({
      type: '[Pairing] Update Pairing SiteIds',
      payload: {
        filters: {
          siteIds: siteIds,
        }
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
