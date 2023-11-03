import { Injectable } from '@angular/core';
import {Observable, zip} from 'rxjs';
import {
  CommonPaginationState,
  OperationDataResult,
  Paged,
  PaginationModel,
  SortModel,
} from 'src/app/common/models';
import { updateTableSort } from 'src/app/common/helpers';
import { getOffset } from 'src/app/common/helpers/pagination.helper';
import { map } from 'rxjs/operators';
import {PlanningModel, PlanningsRequestModel} from '../../../../models';
import { ItemsPlanningPnPlanningsService } from '../../../../services';
import {Store} from '@ngrx/store';
import {
  PlanningsFiltrationState,
  PlanningsState
} from 'src/app/plugins/modules/items-planning-pn/state/plannings/plannings.reducer';
import {
  selectPlanningPagination,
  selectPlanningsFilters, selectPlanningsTagsIds
} from 'src/app/plugins/modules/items-planning-pn/state/plannings/plannings.selector';

@Injectable({ providedIn: 'root' })
export class PlanningsStateService {
  // @ts-ignore
  private selectPlanningPagination$ = this.planningStore.select(selectPlanningPagination);
  // @ts-ignore
  private selectPlanningsFilters$ = this.planningStore.select(selectPlanningsFilters);
  // @ts-ignore
  private selectPlanningsTagsIds$ = this.planningStore.select(selectPlanningsTagsIds);
  constructor(
    private planningStore: Store<PlanningsState>,
    private service: ItemsPlanningPnPlanningsService,
  ) {}

  getAllPlannings(): Observable<OperationDataResult<Paged<PlanningModel>>> {
    let planningsRequestModel = new PlanningsRequestModel();
    zip(this.selectPlanningsFilters$, this.selectPlanningPagination$).subscribe(
        ([filters, pagination]) => {
            planningsRequestModel = {
            ...planningsRequestModel,
            ...filters,
            ...pagination,
            };
        }
        ).unsubscribe();
    return this.getAllPlannings().pipe(
        map((response) => {
            if (response && response.success && response.model) {
                this.planningStore.dispatch({
                    type: '[Plannings] Update Plannings Total', payload: {
                        totalPlannings: response.model.total,
                    }
                });
            }
            return response;
        })
    )
  }

  updateDescriptionFilter(descriptionFilter: string) {
    let currentFilters: PlanningsFiltrationState;
    this.selectPlanningsFilters$.subscribe((filters) => {
      if (filters === undefined) {
        return;
      }
      currentFilters = filters;
    }).unsubscribe();
    this.planningStore.dispatch({
      type: '[Plannings] Update Plannings Filters', payload: {
        filters: {descriptionFilter: descriptionFilter, tagIds: currentFilters.tagIds}
      }
    });
  }

  updateNameFilter(nameFilter: string) {
    let currentFilters: PlanningsFiltrationState;
    this.selectPlanningsFilters$.subscribe((filters) => {
      if (filters === undefined) {
        return;
      }
      currentFilters = filters;
    }).unsubscribe();
    this.planningStore.dispatch({
      type: '[Plannings] Update Plannings Filters', payload: {
        filters: {nameFilter: nameFilter, tagIds: currentFilters.tagIds}
      }
    });
  }

  updatePagination(pagination: PaginationModel) {
    let currentPagination: CommonPaginationState;
    this.selectPlanningPagination$.subscribe((pagination) => {
      if (pagination === undefined) {
        return;
      }
      currentPagination = pagination;
    }).unsubscribe();
    this.planningStore.dispatch({
        type: '[Plannings] Update Plannings Pagination', payload: {
            pagination: {
            ...currentPagination,
            ...pagination,
            }
        }
    });
  }

  updatePageSize(pageSize: number) {
    let currentPagination: CommonPaginationState;
    this.selectPlanningPagination$.subscribe((pagination) => {
      if (pagination === undefined) {
        return;
      }
      currentPagination = pagination;
    }).unsubscribe();
    this.planningStore.dispatch({
        type: '[Plannings] Update Plannings Pagination', payload: {
            pagination: {
            ...currentPagination,
            pageSize: pageSize,
            }
        }
    });
  }

  addOrRemoveTagIds(id: number) {
    let currentTagIds: number[];
    this.selectPlanningsTagsIds$.subscribe((tagIds) => {
      if (tagIds === undefined) {
        return;
      }
      currentTagIds = tagIds;
    }).unsubscribe();
    this.planningStore.dispatch({
      type: '[Plannings] Update Plannings Filters', payload: {
        filters: {tagIds: this.arrayToggle(currentTagIds, id)}
      }
    });
  }

  addOrRemoveDeviceUserIds(id: number) {
    let currentDeviceUserIds: number[];
    this.selectPlanningsFilters$.subscribe((filters) => {
      if (filters === undefined) {
        return;
      }
      currentDeviceUserIds = filters.deviceUserIds;
    }).unsubscribe();
    this.planningStore.dispatch({
      type: '[Plannings] Update Plannings Filters', payload: {
        filters: {deviceUserIds: this.arrayToggle(currentDeviceUserIds, id)}
      }
    });
  }

  changePage(offset: number) {
    let currentPagination: CommonPaginationState;
    this.selectPlanningPagination$.subscribe((pagination) => {
      if (pagination === undefined) {
        return;
      }
      currentPagination = pagination;
    }).unsubscribe();
    this.planningStore.dispatch({
        type: '[Plannings] Update Plannings Pagination', payload: {
            pagination: {
            ...currentPagination,
            offset: offset,
            }
        }
    });
  }

  onDelete() {
    let currentPagination: CommonPaginationState;
    this.selectPlanningPagination$.subscribe((pagination) => {
      if (pagination === undefined) {
        return;
      }
      currentPagination = pagination;
    }).unsubscribe();
    this.planningStore.dispatch({
        type: '[Plannings] Update Plannings Pagination', payload: {
            pagination: {
            ...currentPagination,
            total: currentPagination.total - 1,
            },
        }
    });
  }

  onSortTable(sort: string) {
    let currentPagination: CommonPaginationState;
    this.selectPlanningPagination$.subscribe((pagination) => {
      if (pagination === undefined) {
        return;
      }
      currentPagination = pagination;
    }).unsubscribe();
    const localPageSettings = updateTableSort(
      sort,
      currentPagination.sort,
      currentPagination.isSortDsc
    );
    this.planningStore.dispatch({
        type: '[Plannings] Update Plannings Pagination', payload: {
            pagination: {
            ...currentPagination,
            sort: localPageSettings.sort,
            isSortDsc: localPageSettings.isSortDsc,
            }
        }
    });
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
