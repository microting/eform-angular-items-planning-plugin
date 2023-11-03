import {CommonPaginationState, FiltrationStateModel} from 'src/app/common/models';
import {createReducer} from '@ngrx/store';

export interface PlanningsState {
  pagination: CommonPaginationState;
  filters: PlanningsFiltrationState;
  totalPlannings: number;
}

export class PlanningsFiltrationState extends FiltrationStateModel {
  deviceUserIds: number[];
  descriptionFilter: string;
}

export const initialPlanningsState: PlanningsState = {
  pagination: {
    sort: '',
    pageIndex: 0,
    pageSize: 10,
    offset: 0,
    total: 0,
    isSortDsc: false,
  },
  filters: {
    tagIds: [],
    nameFilter: '',
    deviceUserIds: [],
    descriptionFilter: '',
  },
  totalPlannings: 0,
};

export const _reducer = createReducer(
  initialPlanningsState
)

export function reducer(state: PlanningsState | undefined, action: any) {
  return _reducer(state, action);
}
