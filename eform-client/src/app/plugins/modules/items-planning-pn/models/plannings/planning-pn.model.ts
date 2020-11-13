import {PlanningItemModel} from './planning-item.model';
import {SharedTagModel} from 'src/app/common/models';

export class PlanningsPnModel {
  total: number;
  plannings: Array<PlanningPnModel> = [];
}

export class PlanningPnModel {
  id: number;
  name: string;
  description: string;
  repeatEvery: number;
  repeatType: number;
  dayOfWeek: number;
  dayOfMonth: number;
  repeatUntil: string;
  startDate: string;
  internalRepeatUntil: string;
  relatedEFormId: number;
  relatedEFormName: string;
  item: PlanningItemModel;
  deployedAtEnabled: boolean;
  doneAtEnabled: boolean;
  doneByUserNameEnabled: boolean;
  uploadedDataEnabled: boolean;
  labelEnabled: boolean;
  descriptionEnabled: boolean;
  itemNumberEnabled: boolean;
  locationCodeEnabled: boolean;
  buildYearEnabled: boolean;
  typeEnabled: boolean;
  numberOfImagesEnabled: boolean;
  assignedSites: PlanningAssignedSitesModel[] = [];
  tags: SharedTagModel[];
  tagsIds: number[];
}

export class PlanningAssignedSitesModel {
  siteId: number;
  name: string;
  siteUId: number;
}
