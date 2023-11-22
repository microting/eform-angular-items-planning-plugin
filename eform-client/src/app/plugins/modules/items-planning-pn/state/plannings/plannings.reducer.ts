import {CommonPaginationState, FiltrationStateModel} from 'src/app/common/models';
import {createReducer, on} from '@ngrx/store';
import {
  updatePlanningFilters, updatePlanningFiltersDescription, updatePlanningFiltersName,
  updatePlanningFiltersSites, updatePlanningFiltersTags,
  updatePlanningPagination, updatePlanningTotalPlannings
} from 'src/app/plugins/modules/items-planning-pn/state/plannings/plannings.actions';

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
  initialPlanningsState,
  on(updatePlanningPagination, (state, {payload}) => ({
    ...state,
    pagination: payload.pagination,
  })),
  on(updatePlanningFilters, (state, {payload}) => ({
    ...state,
    filters: payload.filters,
  })),
  on(updatePlanningTotalPlannings, (state, {payload}) => ({
    ...state,
    pagination: {
      ...state.pagination,
      total: payload.pagination.total,
    },
    totalPlannings: payload.totalPlannings,
  })),
  on(updatePlanningFiltersTags, (state, {payload}) => ({
    ...state,
    filters: {
      ...state.filters,
      tagIds: payload.filters.tagIds,
    },
  })),
  on(updatePlanningFiltersSites, (state, {payload}) => ({
    ...state,
    filters: {
      ...state.filters,
      deviceUserIds: payload.filters.deviceUserIds,
    },
  })),
  on(updatePlanningFiltersName, (state, {payload}) => ({
    ...state,
    filters: {
      ...state.filters,
      nameFilter: payload.filters.nameFilter,
    },
  })),
  on(updatePlanningFiltersDescription, (state, {payload}) => ({
    ...state,
    filters: {
      ...state.filters,
      descriptionFilter: payload.filters.descriptionFilter,
    },
  }),
));

export function reducer(state: PlanningsState | undefined, action: any) {
  return _reducer(state, action);
}
