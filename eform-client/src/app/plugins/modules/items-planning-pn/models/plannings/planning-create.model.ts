import {PlanningItemModel} from './planning-item.model';
import {Moment} from 'moment';
import {CommonTranslationModel} from 'src/app/common/models';

export class PlanningCreateModel {
  name: CommonTranslationModel[];
  description: string;
  repeatEvery: number;
  repeatType: number;
  dayOfWeek: number;
  dayOfMonth: number;
  repeatUntil: string;
  startDate: string;
  internalRepeatUntil: Moment | null;
  relatedEFormId: number;
  item: PlanningItemModel = new PlanningItemModel();
  eFormSdkFolderId: number;
  eFormSdkFolderName: string;
  tagsIds: number[];
}
