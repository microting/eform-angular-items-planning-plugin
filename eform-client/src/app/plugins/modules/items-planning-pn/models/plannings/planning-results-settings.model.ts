import {PlanningCasesRequestModel} from './planning-cases-request.model';

export class PlanningResultsPageModel {
  name: string;
  settings: PlanningCasesRequestModel = new PlanningCasesRequestModel();

  constructor(data?: any) {
    if (data) {
      this.name = data.name;
      this.settings = data.settings;
    }
  }
}

export class PlanningResultsSettingsModel {
  pageSize: number;
  sort: string;
  isSortDsc: boolean;
  offset: number;
  listId: number;
  dateFrom: string;
  dateTo: string;

  constructor(data?: any) {
    if (data) {
      this.pageSize = data.pageSize;
      this.sort = data.sort;
      this.isSortDsc = data.isSortDsc;
      this.offset = data.offset;
      this.listId = data.listId;
      this.dateFrom = data.dateFrom;
      this.dateTo = data.dateTo;
    }
  }
}
