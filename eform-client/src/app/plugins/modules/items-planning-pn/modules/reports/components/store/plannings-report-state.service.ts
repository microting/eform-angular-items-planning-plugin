import {Injectable} from '@angular/core';
import {ItemsPlanningPnPlanningsService} from '../../../../services';
import {PlanningsState} from 'src/app/plugins/modules/items-planning-pn/state/plannings/plannings.reducer';
import {Store} from '@ngrx/store';
import {
  selectReportsFilters,
} from 'src/app/plugins/modules/items-planning-pn/state/reports/reports.selector';

@Injectable({providedIn: 'root'})
export class PlanningsReportStateService {
  //private selectReportsFiltersTagsIds$ = this.planningStore.select(selectReportsFiltersTagsIds);
  // @ts-ignore
  private selectReportsFilters$ = this.planningStore.select(selectReportsFilters);
  constructor(
    private planningStore: Store<PlanningsState>,
    private service: ItemsPlanningPnPlanningsService,
  ) {
  }

  addOrRemoveTagIds(id: number) {
    let currentTagIds: number[];
    this.selectReportsFilters$.subscribe((filters) => {
      if (filters === undefined) {
        return;
      }
      currentTagIds = filters.tagIds;
    }).unsubscribe();
    this.planningStore.dispatch({
      type: '[Reports] Update Reports Filters', payload: {
        filters: {tagIds: this.arrayToggle(currentTagIds, id)}
      }
    });
    // this.store.update((state) => ({
    //   filters: {
    //     ...state.filters,
    //     tagIds: arrayToggle(state.filters.tagIds, id),
    //   },
    // }));
  }

  updateDateRange(dateRange: { startDate?: string, endDate?: string, }) {
    this.planningStore.dispatch({
      type: '[Reports] Update Reports Date Range', payload: {
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }
      }
    });
    // this.store.update((state) => ({
    //   dateRange: {
    //     ...{
    //       startDate: dateRange.startDate ? dateRange.startDate : state.dateRange.startDate,
    //       endDate: dateRange.endDate ? dateRange.endDate : state.dateRange.endDate,
    //     }
    //   },
    // }));
  }

  updateScrollPosition(scrollPosition: [number, number]) {
    this.planningStore.dispatch({
      type: '[Reports] Update Reports Scroll Position', payload: {
        scrollPosition: scrollPosition
      }
    });
    // this.store.update((_) => ({
    //   scrollPosition: scrollPosition,
    // }));
  }

  arrayToggle<T>(arr: T[], val: T, forced?: boolean): T[] {
    if (forced && arr.includes(val)) {
      return [...arr];
    } else if (forced === false || arr.includes(val)) {
      return arr.filter((v: typeof val) => v !== val);
    }
    return [...arr, val];
  }
}
