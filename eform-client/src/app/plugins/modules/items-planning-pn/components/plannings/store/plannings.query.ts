import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { PlanningsState, PlanningsStore } from './plannings.store';

@Injectable({ providedIn: 'root' })
export class PlanningsQuery extends Query<PlanningsState> {
  constructor(protected store: PlanningsStore) {
    super(store);
  }

  get pageSetting() {
    return this.getValue();
  }

  selectTagIds$ = this.select((state) => state.pagination.tagIds);
  selectDeviceUsers$ = this.select((state) => state.pagination.deviceUserIds);
  selectDescriptionFilter$ = this.select(
    (state) => state.pagination.descriptionFilter
  );
  selectNameFilter$ = this.select((state) => state.pagination.nameFilter);
  selectPageSize$ = this.select((state) => state.pagination.pageSize);
  selectIsSortDsc$ = this.select((state) => state.pagination.isSortDsc);
  selectSort$ = this.select((state) => state.pagination.sort);
  selectOffset$ = this.select((state) => state.pagination.offset);
}
