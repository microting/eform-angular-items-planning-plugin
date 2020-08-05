import {ReportCaseFieldModel} from './report-case-field.model';

export class ReportEformItemModel {
  id: number;
  createdAt: string;
  doneBy: string;
  itemName: string;
  postsCount: number;
  imagesCount: number;
  caseFields: string[] = [];
}
