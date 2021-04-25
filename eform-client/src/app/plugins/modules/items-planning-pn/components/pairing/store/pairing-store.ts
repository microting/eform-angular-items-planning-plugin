import { Injectable } from '@angular/core';
import { persistState, Store, StoreConfig } from '@datorama/akita';
import { CommonPaginationState } from 'src/app/common/models/common-pagination-state';

export interface PairingState {
  pagination: CommonPaginationState;
}

export function createInitialState(): PairingState {
  return <PairingState>{
    pagination: {
      tagIds: [],
    },
  };
}

export const pairingPersistStorage = persistState({
  include: ['itemsPlanningPnPairing'],
  key: 'pluginsStore',
});

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'itemsPlanningPnPairing' })
export class PairingStore extends Store<PairingState> {
  constructor() {
    super(createInitialState());
  }
}

export const pairingPersistProvider = {
  provide: 'persistStorage',
  useValue: pairingPersistStorage,
  multi: true,
};
