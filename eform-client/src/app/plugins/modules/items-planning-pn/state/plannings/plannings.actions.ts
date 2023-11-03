import {createAction} from '@ngrx/store';

export const updatePlanningFilters = createAction(
  '[Pairing] Update Planning Filters',
  (payload) => ({ payload })
);

export const updatePlanningPagination = createAction(
  '[Pairing] Update Planning Pagination',
  (payload) => ({ payload })
);

export const updatePlanningTotalPlannings = createAction(
  '[Pairing] Update Planning Total Plannings',
  (payload) => ({ payload })
);
