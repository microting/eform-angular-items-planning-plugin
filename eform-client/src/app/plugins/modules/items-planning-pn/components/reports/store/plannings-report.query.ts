import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import {
  PlanningsReportState,
  PlanningsReportStore,
} from './plannings-report.store';

@Injectable({ providedIn: 'root' })
export class PlanningsReportQuery extends Query<PlanningsReportState> {
  constructor(protected store: PlanningsReportStore) {
    super(store);
  }

  get pageSetting() {
    return this.getValue();
  }

  selectScrollPosition$ = this.select((state) => state.scrollPosition);
  selectTagIds$ = this.select((state) => state.filters.tagIds);
}
