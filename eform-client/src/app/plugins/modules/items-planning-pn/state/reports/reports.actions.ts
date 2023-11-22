import {createAction} from '@ngrx/store';

export const updateReportsFilters = createAction(
  '[Reports] Update Reports Filters',
  (payload: any) => ({payload})
);

export const updateReportsDateRange = createAction(
  '[Reports] Update Reports Date Range',
  (payload: any) => ({payload})
);

export const updateReportsScrollPosition = createAction(
  '[Reports] Update Reports Scroll Position',
  (payload: any) => ({payload})
);
