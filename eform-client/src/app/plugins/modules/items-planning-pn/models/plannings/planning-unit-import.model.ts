import {PlanningHeadersModel} from './planning-headers.model';

export class PlanningUnitImportModel {
  importList: string;
  headerList: Array<PlanningHeadersModel> = [];
  headers: string;
}
