import {PairingState} from 'src/app/plugins/modules/items-planning-pn/state/parring/parring.reducer';
import {PlanningsState} from 'src/app/plugins/modules/items-planning-pn/state/plannings/plannings.reducer';
import {PlanningsReportState} from 'src/app/plugins/modules/items-planning-pn/state/reports/reports.reducer';

export interface ItemsPlanningState {
  pairingsState: PairingState;
  planningsState: PlanningsState;
  planningsReportState: PlanningsReportState;
}
