import {createReducer, on} from '@ngrx/store';
import { FiltrationStateModel } from 'src/app/common/models';
import {
  updatePairingFilters, updatePairingFiltersSites,
  updatePairingFiltersTags
} from 'src/app/plugins/modules/items-planning-pn/state/parring/parring.actions';

export interface PairingState {
  filters: PairingFiltrationState;
}
export interface PairingFiltrationState extends FiltrationStateModel {
  siteIds: number[];
}

export const initialState: PairingState = {
  filters: {
    siteIds: [],
    tagIds: [],
    nameFilter: '',
  },
};

export const _reducer = createReducer(
  initialState,
  on(updatePairingFilters, (state, { payload }) => ({
    ...state,
    filters: {
      siteIds: payload.filters.siteIds,
      nameFilter: payload.filters.nameFilter,
      tagIds: payload.filters.tagIds,
    },
  })),
  on(updatePairingFiltersTags, (state, { payload }) => ({
    ...state,
    filters: {
      ...state.filters,
      tagIds: payload.filters.tagIds,
    },
  })),
  on(updatePairingFiltersSites, (state, { payload }) => ({
    ...state,
    filters: {
      ...state.filters,
      siteIds: payload.filters.siteIds,
    },
  })),
)

export function reducer(state: PairingState | undefined, action: any) {
  return _reducer(state, action);
}
