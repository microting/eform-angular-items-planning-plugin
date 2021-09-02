import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationDataResult } from 'src/app/common/models/operation.models';
import { ReportEformPnModel, ReportPnGenerateModel } from '../models/report';
import { ApiBaseService } from 'src/app/common/services';

export let ItemsPlanningPnReportsMethods = {
  Reports: 'api/items-planning-pn/reports',
};

@Injectable()
export class ItemsPlanningPnReportsService {
  constructor(private apiBaseService: ApiBaseService) {}

  generateReport(
    model: ReportPnGenerateModel
  ): Observable<OperationDataResult<ReportEformPnModel[]>> {
    return this.apiBaseService.post(
      ItemsPlanningPnReportsMethods.Reports,
      model
    );
  }

  downloadReport(model: ReportPnGenerateModel): Observable<any> {
    return this.apiBaseService.getBlobData(
      ItemsPlanningPnReportsMethods.Reports + '/file',
      model
    );
  }
}
