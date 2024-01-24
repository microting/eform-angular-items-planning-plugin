import {Injectable} from '@angular/core';
import {tap} from 'rxjs';
import {
  CommonPaginationState,
  PaginationModel,
} from 'src/app/common/models';
import {arrayToggle, updateTableSort} from 'src/app/common/helpers';
import {ItemsPlanningPnPlanningsService} from '../../../../services';
import {Store} from '@ngrx/store';
import {
  PlanningsFiltrationState,
  selectPlanningPagination,
  selectPlanningsFilters,
  updatePlanningFiltersDescription,
  updatePlanningFiltersName,
  updatePlanningFiltersSites,
  updatePlanningFiltersTags,
  updatePlanningPagination,
  updatePlanningTotalPlannings
} from '../../../../state';

@Injectable({providedIn: 'root'})
export class PlanningsStateService {
  private selectPlanningPagination$ = this.store.select(selectPlanningPagination);
  private selectPlanningsFilters$ = this.store.select(selectPlanningsFilters);
  currentPagination: CommonPaginationState;
  currentFilters: PlanningsFiltrationState;

  constructor(
    private store: Store,
    private service: ItemsPlanningPnPlanningsService,
  ) {
    this.selectPlanningPagination$.subscribe(x => this.currentPagination = x);
    this.selectPlanningsFilters$.subscribe(x => this.currentFilters = x);
  }

  getAllPlannings() {
    return this.service.getAllPlannings({
      ...this.currentPagination,
      ...this.currentFilters,
    }).pipe(
      tap((response) => {
        if (response && response.success && response.model) {
          this.store.dispatch(updatePlanningTotalPlannings(response.model.total));
        }
      })
    );
  }

  updateDescriptionFilter(descriptionFilter: string) {
    this.store.dispatch(updatePlanningFiltersDescription(descriptionFilter));
  }

  updateNameFilter(nameFilter: string) {
    this.store.dispatch(updatePlanningFiltersName(nameFilter));
  }

  updatePagination(pagination: PaginationModel) {
    this.store.dispatch(updatePlanningPagination({
      ...this.currentPagination,
      ...pagination,
    }));
  }

  addOrRemoveTagIds(id: number) {
    this.store.dispatch(updatePlanningFiltersTags(arrayToggle(this.currentFilters.tagIds, id)));
  }

  addOrRemoveDeviceUserIds(id: number) {
    this.store.dispatch(updatePlanningFiltersSites(arrayToggle(this.currentFilters.deviceUserIds, id)));
  }

  onDelete() {
    this.store.dispatch(updatePlanningTotalPlannings(this.currentPagination.total - 1));
  }

  onSortTable(sort: string) {
    const localPageSettings = updateTableSort(
      sort,
      this.currentPagination.sort,
      this.currentPagination.isSortDsc
    );
    this.store.dispatch(updatePlanningPagination({
      ...this.currentPagination,
      ...localPageSettings,
    }));
  }
}
