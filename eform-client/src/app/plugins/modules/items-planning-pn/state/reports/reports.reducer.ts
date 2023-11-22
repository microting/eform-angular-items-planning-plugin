import {FiltrationStateModel} from 'src/app/common/models';
import {createReducer} from '@ngrx/store';

export interface PlanningsReportState {
  filters: FiltrationStateModel;
  dateRange: {
    startDate: string,
    endDate: string,
  };
  scrollPosition: [number, number];
}

export const initialPlanningsReportState: PlanningsReportState = {
  filters: {
    nameFilter: '',
    tagIds: [],
  },
  dateRange: {
    startDate: '',
    endDate: '',
  },
  scrollPosition: [0, 0],
};

export const _reducer = createReducer(
  initialPlanningsReportState
)

export function reducer(state: PlanningsReportState | undefined, action: any) {
  return _reducer(state, action);
}
