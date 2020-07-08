import {ItemsPlanningPnHeadersModel} from './items-planning-pn-headers.model';

export class ItemsPlanningPnUnitImportModel {
  importList: string;
  headerList: Array<ItemsPlanningPnHeadersModel> = [];
  headers: string;
}
