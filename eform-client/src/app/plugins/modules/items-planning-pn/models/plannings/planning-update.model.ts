import {PlanningItemModel} from './planning-item.model';
import {Moment} from 'moment';
import {CommonTranslationModel} from 'src/app/common/models';

export class PlanningUpdateModel {
  id: number;
  translationsName: CommonTranslationModel[];
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
  item: PlanningItemModel;
}
