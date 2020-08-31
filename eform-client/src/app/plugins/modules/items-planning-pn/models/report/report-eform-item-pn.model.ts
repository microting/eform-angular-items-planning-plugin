import {ReportCaseFieldModel} from './report-case-field.model';

export class ReportEformItemModel {
  id: number;
  microtingSdkCaseDoneAt: string;
  microtingSdkCaseId: number;
  doneBy: string;
  itemName: string;
  postsCount: number;
  imagesCount: number;
  caseFields: string[] = [];
}
