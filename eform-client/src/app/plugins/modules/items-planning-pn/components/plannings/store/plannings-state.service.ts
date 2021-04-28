import { Injectable } from '@angular/core';
import { PlanningsStore } from './plannings.store';
import { Observable } from 'rxjs';
import { OperationDataResult, Paged } from 'src/app/common/models';
import { updateTableSort } from 'src/app/common/helpers';
import { getOffset } from 'src/app/common/helpers/pagination.helper';
import { map } from 'rxjs/operators';
import { PlanningModel } from 'src/app/plugins/modules/items-planning-pn/models/plannings';
import { PlanningsQuery } from './plannings.query';
import { ItemsPlanningPnPlanningsService } from 'src/app/plugins/modules/items-planning-pn/services';
import { arrayToggle } from '@datorama/akita';

@Injectable({ providedIn: 'root' })
export class PlanningsStateService {
  constructor(
    private store: PlanningsStore,
    private service: ItemsPlanningPnPlanningsService,
    private query: PlanningsQuery
  ) {}

  private total: number;

  getOffset(): Observable<number> {
    return this.query.selectOffset$;
  }

  getPageSize(): Observable<number> {
    return this.query.selectPageSize$;
  }

  getSort(): Observable<string> {
    return this.query.selectSort$;
  }

  getIsSortDsc(): Observable<boolean> {
    return this.query.selectIsSortDsc$;
  }

  getNameFilter(): Observable<string> {
    return this.query.selectNameFilter$;
  }

  getDescriptionFilter(): Observable<string> {
    return this.query.selectDescriptionFilter$;
  }

  getTagIds(): Observable<number[]> {
    return this.query.selectTagIds$;
  }

  getDeviceUserIds(): Observable<number[]> {
    return this.query.selectDeviceUsers$;
  }

  getAllPlannings(): Observable<OperationDataResult<Paged<PlanningModel>>> {
    return this.service
      .getAllPlannings({
        ...this.query.pageSetting.pagination,
        pageIndex: 0,
      })
      .pipe(
        map((response) => {
          if (response && response.success && response.model) {
            this.total = response.model.total;
          }
          return response;
        })
      );
  }

  updateNameFilter(nameFilter: string) {
    this.store.update((state) => ({
      pagination: {
        ...state.pagination,
        nameFilter: nameFilter,
        offset: 0,
      },
    }));
  }

  updatePageSize(pageSize: number) {
    this.store.update((state) => ({
      pagination: {
        ...state.pagination,
        pageSize: pageSize,
      },
    }));
    this.checkOffset();
  }

  addOrRemoveTagIds(id: number) {
    this.store.update((state) => ({
      pagination: {
        ...state.pagination,
        tagIds: arrayToggle(state.pagination.tagIds, id),
      },
    }));
  }

  addOrRemoveDeviceUserIds(id: number) {
    this.store.update((state) => ({
      pagination: {
        ...state.pagination,
        deviceUserIds: arrayToggle(state.pagination.deviceUserIds, id),
      },
    }));
  }

  changePage(offset: number) {
    this.store.update((state) => ({
      pagination: {
        ...state.pagination,
        offset: offset,
      },
    }));
  }

  onDelete() {
    this.total -= 1;
    this.checkOffset();
  }

  onSortTable(sort: string) {
    const localPageSettings = updateTableSort(
      sort,
      this.query.pageSetting.pagination.sort,
      this.query.pageSetting.pagination.isSortDsc
    );
    this.store.update((state) => ({
      pagination: {
        ...state.pagination,
        isSortDsc: localPageSettings.isSortDsc,
        sort: localPageSettings.sort,
      },
    }));
  }

  checkOffset() {
    const newOffset = getOffset(
      this.query.pageSetting.pagination.pageSize,
      this.query.pageSetting.pagination.offset,
      this.total
    );
    if (newOffset !== this.query.pageSetting.pagination.offset) {
      this.store.update((state) => ({
        pagination: {
          ...state.pagination,
          offset: newOffset,
        },
      }));
    }
  }

  updateDescriptionFilter(newDescriptionFilter: string) {
    this.store.update((state) => ({
      pagination: {
        ...state.pagination,
        descriptionFilter: newDescriptionFilter,
      },
    }));
  }
}
