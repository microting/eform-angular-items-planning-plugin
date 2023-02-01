import {CommonTranslationModel, SharedTagModel} from 'src/app/common/models';
import {PlanningEformModel} from './planning-eform.model';
import {PlanningReiterationModel} from './planning-reiteration.model';
import {PlanningFolderModel} from './planning-folder.model';
import {PlanningFieldsModel} from './planning-fields.model';

export class PlanningModel {
  id: number;
  translatedName: string;
  translationsName: CommonTranslationModel[];
  description: string;

  assignedSites: PlanningAssignedSitesModel[] = [];
  tags: SharedTagModel[];
  tagsIds: number[];

  itemNumber: string;
  locationCode: string;
  buildYear: string;
  type: string;
  lastExecutedTime: string;
  nextExecutionTime: string;
  pushMessageSent: boolean;

  folder: PlanningFolderModel = new PlanningFolderModel();
  reiteration: PlanningReiterationModel = new PlanningReiterationModel();
  boundEform: PlanningEformModel = new PlanningEformModel();
  enabledFields: PlanningFieldsModel = new PlanningFieldsModel();
  isLocked: boolean;
  isEditable: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export class PlanningAssignedSitesModel {
  siteId: number;
  name: string;
  siteUId: number;
  status: number;
}
