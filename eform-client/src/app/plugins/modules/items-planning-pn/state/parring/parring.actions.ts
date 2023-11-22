import {createAction} from '@ngrx/store';

export const updatePairingFilters = createAction(
  '[Pairing] Update Pairing Filters',
  (payload: any) => ({payload})
);

export const updatePairingFiltersTags = createAction(
  '[Pairing] Update Pairing TagIds',
  (payload: any) => ({payload})
);

export const updatePairingFiltersSites = createAction(
  '[Pairing] Update Pairing SiteIds',
  (payload: any) => ({payload})
);
