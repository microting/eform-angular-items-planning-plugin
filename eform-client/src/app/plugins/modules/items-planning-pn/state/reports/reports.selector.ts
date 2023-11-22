import {ItemsPlanningState} from 'src/app/plugins/modules/items-planning-pn/state/items-planning.state';
import {createSelector} from '@ngrx/store';

export const selectItemsPlanningPn = (state: {itemsPlanningPn: ItemsPlanningState}) => state.itemsPlanningPn;
export const selectReports = createSelector(selectItemsPlanningPn, (state) => state.planningsReportState);
export const selectReportsFilters =
  createSelector(selectReports, (state) => state.filters);
export const selectReportsDateRange =
  createSelector(selectReports, (state) => state.dateRange);
export const selectReportsScrollPosition =
  createSelector(selectReports, (state) => state.scrollPosition);
export const selectReportsFiltersTagsIds =
  createSelector(selectReports, (state) => state.filters.tagIds);
