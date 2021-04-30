import { Injectable } from '@angular/core';
import { persistState, Store, StoreConfig } from '@datorama/akita';
import { CommonPaginationState } from 'src/app/common/models/common-pagination-state';
import { FiltrationStateModel } from 'src/app/common/models';

export interface PlanningsState {
  pagination: CommonPaginationState;
  filters: PlanningsFiltrationState;
  totalPlannings: number;
}

export class PlanningsFiltrationState extends FiltrationStateModel {
  deviceUserIds: number[];
  descriptionFilter: string;
}

function createInitialState(): PlanningsState {
  return <PlanningsState>{
    pagination: {
      pageSize: 10,
      sort: 'Id',
      isSortDsc: false,
      offset: 0,
    },
    filters: {
      descriptionFilter: '',
      deviceUserIds: [],
      nameFilter: '',
      tagIds: [],
    },
    totalPlannings: 0,
  };
}

const planningsPersistStorage = persistState({
  include: ['plannings'],
  key: 'itemsPlanningPn',
  preStoreUpdate(storeName, state: PlanningsState) {
    return {
      pagination: state.pagination,
      filters: state.filters,
    };
  },
});

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'plannings', resettable: true })
export class PlanningsStore extends Store<PlanningsState> {
  constructor() {
    super(createInitialState());
  }
}

export const planningsPersistProvider = {
  provide: 'persistStorage',
  useValue: planningsPersistStorage,
  multi: true,
};
