import {createAction} from '@ngrx/store';
import {PairingFiltrationState} from './';

export const updatePairingFilters = createAction(
  '[Pairing] Update Pairing Filters',
  (payload: PairingFiltrationState) => ({payload})
);

export const updatePairingFiltersTags = createAction(
  '[Pairing] Update Pairing TagIds',
  (payload: number[]) => ({payload})
);

export const updatePairingFiltersSites = createAction(
  '[Pairing] Update Pairing SiteIds',
  (payload: number[]) => ({payload})
);
