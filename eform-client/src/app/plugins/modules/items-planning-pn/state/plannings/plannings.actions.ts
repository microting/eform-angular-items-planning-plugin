import {createAction} from '@ngrx/store';

export const updatePlanningFilters = createAction(
  '[Planning] Update Planning Filters',
  (payload) => ({ payload })
);

export const updatePlanningPagination = createAction(
  '[Planning] Update Planning Pagination',
  (payload) => ({ payload })
);

export const updatePlanningTotalPlannings = createAction(
  '[Planning] Update Planning Total Plannings',
  (payload) => ({ payload })
);

export const updatePlanningFiltersTags = createAction(
  '[Planning] Update Planning TagIds',
  (payload) => ({ payload })
);

export const updatePlanningFiltersSites = createAction(
  '[Planning] Update Planning SiteIds',
  (payload) => ({ payload })
);

export const updatePlanningFiltersName = createAction(
  '[Planning] Update Planning NameFilter',
  (payload) => ({ payload })
);

export const updatePlanningFiltersDescription = createAction(
  '[Planning] Update Planning DescriptionFilter',
  (payload) => ({ payload })
);
