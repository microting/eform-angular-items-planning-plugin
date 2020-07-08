import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';

import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {OperationDataResult} from 'src/app/common/models/operation.models';
import {BaseService} from 'src/app/common/services/base.service';
import {ReportPnFullModel, ReportPnGenerateModel} from '../models/report';

export let ItemsPlanningPnReportsMethods = {
  Reports: 'api/items-planning-pn/reports',
};

@Injectable()
export class ItemsPlanningPnReportsService extends BaseService {
  constructor(private _http: HttpClient, router: Router, toastrService: ToastrService) {
    super(_http, router, toastrService);
  }

  generateReport(model: ReportPnGenerateModel): Observable<OperationDataResult<ReportPnFullModel>> {
    return this.get(ItemsPlanningPnReportsMethods.Reports, model);
  }

  getGeneratedReport(model: ReportPnGenerateModel): Observable<any> {
    return this.getBlobData(ItemsPlanningPnReportsMethods.Reports + '/excel', model);
  }

}
