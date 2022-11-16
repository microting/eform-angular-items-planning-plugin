import { Injectable } from '@angular/core';
import { persistState, Store, StoreConfig } from '@datorama/akita';
import { FiltrationStateModel } from 'src/app/common/models';

export interface PairingState {
  filters: PairingFiltrationState;
}

export interface PairingFiltrationState extends FiltrationStateModel {
  siteIds: number[];
}

export function createInitialState(): PairingState {
  return <PairingState>{
    filters: {
      tagIds: [],
      siteIds: [],
    },
  };
}

const pairingPersistStorage = persistState({
  include: ['pairing'],
  key: 'itemsPlanningPn',
  preStorageUpdate(storeName, state) {
    return {
      filters: state.filters,
    };
  },
});

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'pairing', resettable: true })
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
