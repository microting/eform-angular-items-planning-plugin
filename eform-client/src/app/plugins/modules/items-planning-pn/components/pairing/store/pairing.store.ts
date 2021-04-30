import { Injectable } from '@angular/core';
import { persistState, Store, StoreConfig } from '@datorama/akita';
import { FiltrationStateModel } from 'src/app/common/models';

export interface PairingState {
  filters: FiltrationStateModel;
}

export function createInitialState(): PairingState {
  return <PairingState>{
    filters: {
      tagIds: [],
    },
  };
}

const pairingPersistStorage = persistState({
  include: ['pairing'],
  key: 'itemsPlanningPn',
  preStoreUpdate(storeName, state) {
    return {
      filters: state.filters,
    };
  },
});

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'pairing' })
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
