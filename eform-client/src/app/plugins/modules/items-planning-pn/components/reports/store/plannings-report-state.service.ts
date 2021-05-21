import { Injectable } from '@angular/core';
import { PlanningsReportStore, PlanningsReportQuery } from './';
import { Observable } from 'rxjs';
import { ItemsPlanningPnPlanningsService } from '../../../services';
import { arrayToggle } from '@datorama/akita';

@Injectable({ providedIn: 'root' })
export class PlanningsReportStateService {
  constructor(
    private store: PlanningsReportStore,
    private service: ItemsPlanningPnPlanningsService,
    private query: PlanningsReportQuery
  ) {}

  getTagIds(): Observable<number[]> {
    return this.query.selectTagIds$;
  }

  addOrRemoveTagIds(id: number) {
    this.store.update((state) => ({
      filters: {
        ...state.filters,
        tagIds: arrayToggle(state.filters.tagIds, id),
      },
    }));
  }
}
