import {createAction} from '@ngrx/store';
import {CommonPaginationState} from 'src/app/common/models';
import {PlanningsFiltrationState} from './';

export const updatePlanningFilters = createAction(
  '[Planning] Update Planning Filters',
  (payload: PlanningsFiltrationState) => ({payload})
);

export const updatePlanningPagination = createAction(
  '[Planning] Update Planning Pagination',
  (payload: CommonPaginationState) => ({payload})
);

export const updatePlanningTotalPlannings = createAction(
  '[Planning] Update Planning Total Plannings',
  (payload: number) => ({payload})
);

export const updatePlanningFiltersTags = createAction(
  '[Planning] Update Planning TagIds',
  (payload: number[]) => ({payload})
);

export const updatePlanningFiltersSites = createAction(
  '[Planning] Update Planning SiteIds',
  (payload: number[]) => ({payload})
);

export const updatePlanningFiltersName = createAction(
  '[Planning] Update Planning NameFilter',
  (payload: string) => ({payload})
);

export const updatePlanningFiltersDescription = createAction(
  '[Planning] Update Planning DescriptionFilter',
  (payload: string) => ({payload})
);
