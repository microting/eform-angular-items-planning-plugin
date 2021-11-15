import { Injectable } from '@angular/core';
import { persistState, Store, StoreConfig } from '@datorama/akita';
import { FiltrationStateModel } from 'src/app/common/models';

export interface PlanningsReportState {
  filters: FiltrationStateModel;
  dateRange: string[];
}

function createInitialState(): PlanningsReportState {
  return <PlanningsReportState>{
    filters: {
      tagIds: [],
    },
    dateRange: [],
  };
}

const planningsReportPersistStorage = persistState({
  include: ['planningsReport'],
  key: 'itemsPlanningPn',
  preStorageUpdate(
    storeName,
    state: PlanningsReportState
  ): PlanningsReportState {
    return {
      filters: state.filters,
      dateRange: state.dateRange,
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
