import {
  ApplicationPageModel,
  PageSettingsModel
} from 'src/app/common/models/settings';
import {PlanningResultsPageModel, PlanningResultsSettingsModel} from '../models/plannings';
import {PlanningCasesRequestModel} from '../models/plannings/planning-cases-request.model';

export const ItemsPlanningPnLocalSettings = [
  new ApplicationPageModel({
      name: 'Plannings',
      settings: new PageSettingsModel({
        pageSize: 10,
        sort: 'Id',
        isSortDsc: false
      })
    },
  ),
  new ApplicationPageModel({
      name: 'PlanningCases',
      settings: new PageSettingsModel({
        pageSize: 10,
        sort: 'Id',
        isSortDsc: false
      })
    },
  ),
  new PlanningResultsPageModel({
      name: 'PlanningCaseResults',
      settings: {
        pageSize: 10,
        sort: 'Id',
        isSortDsc: false,
        pageIndex: 1,
        offset: 0,
        listId: 0,
        dateFrom: '',
        dateTo: ''
      }
    },
  )
];

