import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { PairingState, PairingStore } from './';

@Injectable({ providedIn: 'root' })
export class PairingQuery extends Query<PairingState> {
  constructor(protected store: PairingStore) {
    super(store);
  }

  get pageSetting() {
    return this.getValue();
  }

  selectTagIds$ = this.select((state) => state.filters.tagIds);
}
