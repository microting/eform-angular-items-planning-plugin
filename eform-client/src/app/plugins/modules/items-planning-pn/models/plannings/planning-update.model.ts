import {PlanningItemModel} from './planning-item.model';
import {Moment} from 'moment';

export class PlanningUpdateModel {
  id: number;
  name: string;
  description: string;
  repeatEvery: number;
  repeatType: number;
  dayOfWeek: number;
  dayOfMonth: number;
  repeatUntil: string | null;
  relatedEFormId: number;
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
  item: PlanningItemModel;
}
