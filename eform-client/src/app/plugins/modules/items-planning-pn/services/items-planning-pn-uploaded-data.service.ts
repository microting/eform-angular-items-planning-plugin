import { UploadedDatasModel } from '../models/plannings';
import { Observable } from 'rxjs';
import { OperationDataResult, OperationResult } from 'src/app/common/models';
import { Injectable } from '@angular/core';
import { ApiBaseService } from 'src/app/common/services';

export let ItemsPlanningPnUploadedDataMethods = {
  UploadedDatas: 'api/items-planning-pn/uploaded-data',
  DownloadPDF: 'api/items-planning-pn/uploaded-data/download-pdf/',
};
@Injectable({
  providedIn: 'root',
})
export class ItemsPlanningPnUploadedDataService {
  constructor(private apiBaseService: ApiBaseService) {}

  getAllUploadedData(
    itemCaseId: number
  ): Observable<OperationDataResult<UploadedDatasModel>> {
    return this.apiBaseService.get(
      ItemsPlanningPnUploadedDataMethods.UploadedDatas +
        '/get-all/' +
        itemCaseId
    );
  }

  deleteUploadedData(uploadedDataId: number): Observable<OperationResult> {
    return this.apiBaseService.delete(
      ItemsPlanningPnUploadedDataMethods.UploadedDatas + '/' + uploadedDataId
    );
  }

  downloadUploadedDataPdf(fileName: string): Observable<OperationResult> {
    return this.apiBaseService.get(
      ItemsPlanningPnUploadedDataMethods.DownloadPDF,
      fileName
    );
  }
}
