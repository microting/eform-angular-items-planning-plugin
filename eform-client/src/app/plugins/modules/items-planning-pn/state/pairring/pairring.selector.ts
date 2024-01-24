import {createSelector} from '@ngrx/store';
import {ItemsPlanningState} from '../items-planning.state';
import {AppState} from 'src/app/state';

const selectItemsPlanningPn = (state: AppState & {itemsPlanningPn: ItemsPlanningState}) => state.itemsPlanningPn;
export const selectPairingState =
  createSelector(selectItemsPlanningPn, (state: ItemsPlanningState) => state.pairingsState);
export const selectPairingsFilters =
  createSelector(selectPairingState, (state) => state.filters);
export const selectPairingsTagsIds =
  createSelector(selectPairingsFilters, (state) => state.tagIds);
export const selectPairingsSiteIds =
  createSelector(selectPairingsFilters, (state) => state.siteIds);
