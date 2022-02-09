import { Observable } from 'rxjs';
import {OperationDataResult, OperationResult, ReplyRequest} from 'src/app/common/models';
import {
  PlanningCaseModel,
  PlanningCasesModel,
} from '../models/plannings/planning-cases/planning-cases.model';
import { Injectable } from '@angular/core';
import {
  PlanningCasesRequestModel,
  PlanningCaseResultListModel,
} from '../models/plannings/planning-cases';
import { ApiBaseService } from 'src/app/common/services';
import {BackendConfigurationPnCompliancesMethods} from 'src/app/plugins/modules/backend-configuration-pn/services';

export let ItemsPlanningPnCasesMethods = {
  Cases: 'api/items-planning-pn/plannings-cases',
  CaseResults: 'api/items-planning-pn/plannings-case-results',
  GetCases: 'api/items-planning-pn/cases',
};
@Injectable({
  providedIn: 'root',
})
export class ItemsPlanningPnCasesService {
  constructor(private apiBaseService: ApiBaseService) {}

  getAllCases(
    model: PlanningCasesRequestModel
  ): Observable<OperationDataResult<PlanningCasesModel>> {
    return this.apiBaseService.get(ItemsPlanningPnCasesMethods.Cases, model);
  }

  getAllCaseResults(
    model: PlanningCasesRequestModel
  ): Observable<OperationDataResult<PlanningCaseResultListModel>> {
    return this.apiBaseService.get(
      ItemsPlanningPnCasesMethods.CaseResults,
      model
    );
  }

  getSingleCase(
    caseId: number
  ): Observable<OperationDataResult<PlanningCaseModel>> {
    return this.apiBaseService.get(
      ItemsPlanningPnCasesMethods.Cases + '/:id/' + caseId
    );
  }

  getGeneratedReport(model: PlanningCasesRequestModel): Observable<any> {
    return this.apiBaseService.getBlobData(
      ItemsPlanningPnCasesMethods.CaseResults + '/excel',
      model
    );
  }

  updateCase(
    model: ReplyRequest,
    templateId: number
  ): Observable<OperationResult> {
    return this.apiBaseService.put<ReplyRequest>(
      ItemsPlanningPnCasesMethods.GetCases,
      model
    );
  }
}
