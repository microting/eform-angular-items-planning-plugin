import { Injectable } from '@angular/core';
import { persistState, Store, StoreConfig } from '@datorama/akita';
import { FiltrationStateModel } from 'src/app/common/models';

export interface PlanningsReportState {
  filters: FiltrationStateModel;
}

function createInitialState(): PlanningsReportState {
  return <PlanningsReportState>{
    filters: {
      tagIds: [],
    },
  };
}

const planningsReportPersistStorage = persistState({
  include: ['planningsReport'],
  key: 'itemsPlanningPn',
  preStorageUpdate(storeName, state: PlanningsReportState) {
    return {
      filters: state.filters,
    };
  },
});

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'planningsReport', resettable: true })
export class PlanningsReportStore extends Store<PlanningsReportState> {
  constructor() {
    super(createInitialState());
  }
}

export const planningsReportPersistProvider = {
  provide: 'persistStorage',
  useValue: planningsReportPersistStorage,
  multi: true,
};
