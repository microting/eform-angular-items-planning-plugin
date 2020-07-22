import {PlanningItemModel} from './planning-item.model';

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
  sdkFieldEnabled1: boolean;
  sdkFieldEnabled2: boolean;
  sdkFieldEnabled3: boolean;
  sdkFieldEnabled4: boolean;
  sdkFieldEnabled5: boolean;
  sdkFieldEnabled6: boolean;
  sdkFieldEnabled7: boolean;
  sdkFieldEnabled8: boolean;
  sdkFieldEnabled9: boolean;
  sdkFieldEnabled10: boolean;
  itemNumberEnabled: boolean;
  locationCodeEnabled: boolean;
  buildYearEnabled: boolean;
  typeEnabled: boolean;
  numberOfImagesEnabled: boolean;
  sdkFieldId1: number;
  sdkFieldId2: number;
  sdkFieldId3: number;
  sdkFieldId4: number;
  sdkFieldId5: number;
  sdkFieldId6: number;
  sdkFieldId7: number;
  sdkFieldId8: number;
  sdkFieldId9: number;
  sdkFieldId10: number;

  assignedSites: PlanningAssignedSitesModel[] = [];
}

export class PlanningAssignedSitesModel {
  siteId: number;
  name: string;
  siteUId: number;
}
