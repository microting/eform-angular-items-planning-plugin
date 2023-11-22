import {ItemsPlanningState} from 'src/app/plugins/modules/items-planning-pn/state/items-planning.state';
import {createSelector} from '@ngrx/store';

export const selectItemsPlanningPn = (state: {itemsPlanningPn: ItemsPlanningState}) => state.itemsPlanningPn;
export const selectPlannings =
  createSelector(selectItemsPlanningPn, (state: ItemsPlanningState) => state.planningsState);

export const selectPlanningsFilters =
  createSelector(selectPlannings, (state) => state.filters);
export const selectPlanningsTagsIds =
  createSelector(selectPlannings, (state) => state.filters.tagIds);
export const selectPlanningsDeviceUserIds =
  createSelector(selectPlannings, (state) => state.filters.deviceUserIds);
export const selectPlanningsDescriptionFilter =
  createSelector(selectPlannings, (state) => state.filters.descriptionFilter);
export const selectPlanningsNameFilter =
  createSelector(selectPlannings, (state) => state.filters.nameFilter);
export const selectPlanningPagination =
  createSelector(selectPlannings, (state) => state.pagination);
export const selectPlanningsPaginationSort =
  createSelector(selectPlannings, (state) => state.pagination.sort);
export const selectPlanningsPaginationIsSortDsc =
  createSelector(selectPlannings, (state) => state.pagination.isSortDsc ? 'asc' : 'desc');
export const selectPlanningsPaginationOffset =
  createSelector(selectPlannings, (state) => state.pagination.offset);
export const selectPlanningsTotal =
  createSelector(selectPlannings, (state) => state.pagination.total);
export const selectPlanningsPageSize =
  createSelector(selectPlannings, (state) => state.pagination.pageSize);
export const selectPlanningsPageIndex =
  createSelector(selectPlannings, (state) => state.pagination.pageIndex);
