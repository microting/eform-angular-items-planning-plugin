import {createSelector} from '@ngrx/store';
import {ItemsPlanningState} from 'src/app/plugins/modules/items-planning-pn/state/items-planning.state';

export const selectItemsPlanningPn = (state: {itemsPlanningPn: ItemsPlanningState}) => state.itemsPlanningPn;
export const selectParringsState =
  createSelector(selectItemsPlanningPn, (state: ItemsPlanningState) => state.pairingsState);
//export const selectParrings = (state: ItemsPlanningState) => state.pairingsState;
export const selectParringsTagsIds =
  createSelector(selectParringsState, (state) => state.filters.tagIds);
export const selectParringsSiteIds =
  createSelector(selectParringsState, (state) => state.filters.siteIds);

export const selectParringsFilters =
  createSelector(selectParringsState, (state) => state.filters);
