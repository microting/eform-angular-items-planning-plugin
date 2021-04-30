import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { PlanningsState, PlanningsStore } from './plannings.store';
import { PaginationModel, SortModel } from 'src/app/common/models';

@Injectable({ providedIn: 'root' })
export class PlanningsQuery extends Query<PlanningsState> {
  constructor(protected store: PlanningsStore) {
    super(store);
  }

  get pageSetting() {
    return this.getValue();
  }

  selectTagIds$ = this.select((state) => state.filtration.tagIds);
  selectDeviceUsers$ = this.select((state) => state.filtration.deviceUserIds);
  selectDescriptionFilter$ = this.select(
    (state) => state.filtration.descriptionFilter
  );
  selectNameFilter$ = this.select((state) => state.filtration.nameFilter);
  selectPageSize$ = this.select((state) => state.pagination.pageSize);
  // selectIsSortDsc$ = this.select((state) => state.pagination.isSortDsc);
  // selectSort$ = this.select((state) => state.pagination.sort);
  // selectOffset$ = this.select((state) => state.pagination.offset);
  selectPagination$ = this.select(
    (state) =>
      new PaginationModel(
        state.totalPlannings,
        state.pagination.pageSize,
        state.pagination.offset
      )
  );
  selectSort$ = this.select(
    (state) => new SortModel(state.pagination.sort, state.pagination.isSortDsc)
  );
}
