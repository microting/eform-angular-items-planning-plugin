import {createSelector} from '@ngrx/store';
import {ItemsPlanningState} from 'src/app/plugins/modules/items-planning-pn/state/items-planning.state';

export const selectParrings = (state: ItemsPlanningState) => state.pairingsState;
export const selectParringsTagsIds =
  createSelector(selectParrings, (state) => state.filters.tagIds);
export const selectParringsSiteIds =
  createSelector(selectParrings, (state) => state.filters.siteIds);

export const selectParringsFilters =
  createSelector(selectParrings, (state) => state.filters);
