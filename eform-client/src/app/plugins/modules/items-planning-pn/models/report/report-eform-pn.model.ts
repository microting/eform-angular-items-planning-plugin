import {ReportEformItemModel} from './report-eform-item-pn.model';
import {ReportEformPostModel} from './report-eform-post-pn.model';

export class ReportEformPnModel {
  name: string;
  items: ReportEformItemModel[] = [];
  itemHeaders: {key: string, value: string}[] = [];
  imageNames: {key: {key: number, value: string}, value: {key: string, value: string}}[] = [];
  posts: ReportEformPostModel[] = [];
}
