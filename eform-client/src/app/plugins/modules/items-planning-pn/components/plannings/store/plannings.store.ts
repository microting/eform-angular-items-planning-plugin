import { Injectable } from '@angular/core';
import { persistState, Store, StoreConfig } from '@datorama/akita';
import { CommonPaginationState } from 'src/app/common/models/common-pagination-state';

export interface PlanningsState {
  pagination: PlanningsPaginationState;
}

export class PlanningsPaginationState extends CommonPaginationState {
  deviceUserIds: number[];
}

function createInitialState(): PlanningsState {
  return <PlanningsState>{
    pagination: {
      pageSize: 10,
      sort: 'Id',
      isSortDsc: false,
      nameFilter: '',
      offset: 0,
      descriptionFilter: '',
      tagIds: [],
      deviceUserIds: []
    },
  };
}

export const planningsPersistStorage = persistState({
  include: ['itemsPlanningPnPlannings'],
  key: 'pluginsStore',
  preStoreUpdate(storeName, state) {
    return {
      pagination: state.pagination,
    };
  }
});

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'itemsPlanningPnPlannings', resettable: true })
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
