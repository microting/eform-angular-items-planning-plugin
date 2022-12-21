import {Component, ElementRef, EventEmitter, OnInit, ViewChild,} from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {LoaderService} from 'src/app/common/services/loader.service';
import {AuthStateService} from 'src/app/common/store';
import {MatDialogRef} from '@angular/material/dialog';
import {MtxGridColumn} from '@ng-matero/extensions/grid';
import {OperationDataResult} from 'src/app/common/models';

@Component({
  selector: 'app-plannings-bulk-import-modal',
  templateUrl: './plannings-bulk-import-modal.component.html',
  styleUrls: ['./plannings-bulk-import-modal.component.scss'],
})
export class PlanningsBulkImportModalComponent implements OnInit {
  @ViewChild('xlsxPlannings', { static: false }) xlsxPlannings: ElementRef;
  importFinished: EventEmitter<void> = new EventEmitter<void>();
  xlsxPlanningsFileUploader: FileUploader = new FileUploader({
    url: '/api/items-planning-pn/plannings/import',
    authToken: this.authStateService.bearerToken,
  });
  errors: { row: number; col: number; message: string }[] = [];

  tableHeaders: MtxGridColumn[] = [
    {header: this.translateService.stream('Column'), field: 'col'},
    {header: this.translateService.stream('Row'), field: 'row'},
    {header: this.translateService.stream('Error'), field: 'message'},
  ];

  constructor(
    private toastrService: ToastrService,
    private translateService: TranslateService,
    public loaderService: LoaderService,
    private authStateService: AuthStateService,
    public dialogRef: MatDialogRef<PlanningsBulkImportModalComponent>,
  ) {

    this.xlsxPlanningsFileUploader.clearQueue();
  }

  ngOnInit() {
    this.xlsxPlanningsFileUploader.onSuccessItem = (item, response) => {
      const model = JSON.parse(response).model as OperationDataResult<{errors: []}>
      if (model) {
        this.errors = model.model.errors;
        this.xlsxPlanningsFileUploader.clearQueue();
      }
      if (this.errors && this.errors.length > 0) {
        this.toastrService.warning(
          this.translateService.instant('Import has been finished partially')
        );
      } else {
        this.toastrService.success(
          this.translateService.instant('Import has been finished successfully')
        );
        this.importFinished.emit();
        this.excelPlanningsModal();
      }
      this.loaderService.setLoading(false);
      this.xlsxPlannings.nativeElement.value = '';
    };
    this.xlsxPlanningsFileUploader.onErrorItem = () => {
      this.xlsxPlanningsFileUploader.clearQueue();
      this.toastrService.error(
        this.translateService.instant('Error while making import')
      );
      this.xlsxPlannings.nativeElement.value = '';
    };
    this.xlsxPlanningsFileUploader.onAfterAddingFile = (f) => {
      if (this.xlsxPlanningsFileUploader.queue.length > 1) {
        this.xlsxPlanningsFileUploader.removeFromQueue(
          this.xlsxPlanningsFileUploader.queue[0]
        );
      }
    };
  }

  uploadExcelPlanningsFile() {
    this.xlsxPlanningsFileUploader.queue[0].upload();
    this.loaderService.setLoading(true);
  }

  excelPlanningsModal() {
    this.dialogRef.close();
    this.xlsxPlanningsFileUploader.clearQueue();
  }
}
