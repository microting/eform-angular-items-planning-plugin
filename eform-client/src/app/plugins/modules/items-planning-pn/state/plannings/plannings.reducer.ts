import {CommonPaginationState, FiltrationStateModel} from 'src/app/common/models';
import {createReducer, on} from '@ngrx/store';
import {
  updatePlanningFilters,
  updatePlanningFiltersDescription,
  updatePlanningFiltersName,
  updatePlanningFiltersSites,
  updatePlanningFiltersTags,
  updatePlanningPagination,
  updatePlanningTotalPlannings
} from './plannings.actions';

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
    sort: 'Id',
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

const _reducer = createReducer(
  initialPlanningsState,
  on(updatePlanningPagination, (state, {payload}) => ({
    ...state,
    pagination: {...state.pagination, ...payload},
  })),
  on(updatePlanningFilters, (state, {payload}) => ({
    ...state,
    filters: {...state.filters, ...payload},
  })),
  on(updatePlanningTotalPlannings, (state, {payload}) => ({
    ...state,
    pagination: {...state.pagination, total: payload,},
    totalPlannings: payload,
  })),
  on(updatePlanningFiltersTags, (state, {payload}) => ({
    ...state,
    filters: {...state.filters, tagIds: payload,},
  })),
  on(updatePlanningFiltersSites, (state, {payload}) => ({
    ...state,
    filters: {...state.filters, deviceUserIds: payload,},
  })),
  on(updatePlanningFiltersName, (state, {payload}) => ({
    ...state,
    filters: {...state.filters, nameFilter: payload,},
  })),
  on(updatePlanningFiltersDescription, (state, {payload}) => ({
    ...state,
    filters: {...state.filters, descriptionFilter: payload,},
  }),
));

export function planningsReducer(state: PlanningsState | undefined, action: any) {
  return _reducer(state, action);
}
