import {createAction} from '@ngrx/store';

export const updatePairingFilters = createAction(
  '[Pairing] Update Pairing Filters',
  (payload: any) => ({payload})
);
