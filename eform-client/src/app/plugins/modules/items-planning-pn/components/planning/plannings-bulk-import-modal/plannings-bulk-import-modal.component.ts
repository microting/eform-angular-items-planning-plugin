import {Component, OnInit, ViewChild} from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {AuthService} from 'src/app/common/services';
import {LoaderService} from 'src/app/common/services/loeader.service';

@Component({
  selector: 'app-plannings-bulk-import-modal',
  templateUrl: './plannings-bulk-import-modal.component.html',
  styleUrls: ['./plannings-bulk-import-modal.component.scss']
})
export class PlanningsBulkImportModalComponent implements OnInit {
  @ViewChild('frame', {static: true}) frame;
  xlsxPlanningsFileUploader: FileUploader = new FileUploader({
    url: '/api/items-planning-pn/plannings/import', authToken: this.authService.bearerToken
  });

  constructor(private toastrService: ToastrService,
              private translateService: TranslateService,
              private authService: AuthService,
              private loaderService: LoaderService) {
  }

  ngOnInit() {
    this.xlsxPlanningsFileUploader.onSuccessItem = () => {
      this.xlsxPlanningsFileUploader.clearQueue();
      this.toastrService.success(this.translateService.instant('Import has been finished successfully'));
      this.loaderService.isLoading.next(false);
      // this.frame.hide();
    };
    this.xlsxPlanningsFileUploader.onErrorItem = () => {
      this.xlsxPlanningsFileUploader.clearQueue();
      this.toastrService.error(this.translateService.instant('Error while making import'));
    };
    this.xlsxPlanningsFileUploader.onAfterAddingFile = f => {
      if (this.xlsxPlanningsFileUploader.queue.length > 1) {
        this.xlsxPlanningsFileUploader.removeFromQueue(this.xlsxPlanningsFileUploader.queue[0]);
      }
    };
  }

  show() {
    this.frame.show();
  }

  uploadExcelPlanningsFile() {
    this.xlsxPlanningsFileUploader.queue[0].upload();
    this.loaderService.isLoading.next(true);
  }

  excelPlanningsModal() {
    this.xlsxPlanningsFileUploader.clearQueue();
    this.frame.hide();
  }
}
