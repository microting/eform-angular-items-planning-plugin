import {CommonTranslationModel} from 'src/app/common/models';
import {
  PlanningFolderModel,
  PlanningReiterationModel,
  PlanningEformModel,
} from './';

export class PlanningCreateModel {
  translationsName: CommonTranslationModel[];
  description: string;
  tagsIds: number[];

  planningNumber: string;
  locationCode: string;
  buildYear: string;
  type: string;

  folder: PlanningFolderModel = new PlanningFolderModel();
  reiteration: PlanningReiterationModel = new PlanningReiterationModel();
  boundEform: PlanningEformModel = new PlanningEformModel();
}
