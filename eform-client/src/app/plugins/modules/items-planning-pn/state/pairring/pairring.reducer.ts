import {createReducer, on} from '@ngrx/store';
import {FiltrationStateModel} from 'src/app/common/models';
import {
  updatePairingFilters,
  updatePairingFiltersSites,
  updatePairingFiltersTags
} from './pairring.actions';

export interface PairingState {
  filters: PairingFiltrationState;
}

export interface PairingFiltrationState extends FiltrationStateModel {
  siteIds: number[];
}

export const pairingInitialState: PairingState = {
  filters: {
    siteIds: [],
    tagIds: [],
    nameFilter: '',
  },
};

const _reducer = createReducer(
  pairingInitialState,
  on(updatePairingFilters, (state, {payload}) => ({
    ...state,
    filters: {...state.filters, ...payload,},
  })),
  on(updatePairingFiltersTags, (state, {payload}) => ({
    ...state,
    filters: {...state.filters, tagIds: payload,},
  })),
  on(updatePairingFiltersSites, (state, {payload}) => ({
    ...state,
    filters: {...state.filters, siteIds: payload,},
  })),
);

export function pairingReducer(state: PairingState | undefined, action: any) {
  return _reducer(state, action);
}
