import {ReportEformItemModel} from './report-eform-item-pn.model';
import {ReportEformPostModel} from './report-eform-post-pn.model';

export class ReportEformPnModel {
  name: string;
  items: ReportEformItemModel[] = [];
  itemHeaders: {key: string, value: string}[] = [];
  imagesNames: {key: string, value: string}[] = [];
  posts: ReportEformPostModel[] = [];
}
