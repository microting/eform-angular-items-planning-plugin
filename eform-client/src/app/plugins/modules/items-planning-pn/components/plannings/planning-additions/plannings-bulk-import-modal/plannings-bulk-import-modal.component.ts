import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/common/services';
import { LoaderService } from 'src/app/common/services/loeader.service';
import { ItemsPlanningPnPlanningsService } from 'src/app/plugins/modules/items-planning-pn/services';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Subscription } from 'rxjs';

@AutoUnsubscribe()
@Component({
  selector: 'app-plannings-bulk-import-modal',
  templateUrl: './plannings-bulk-import-modal.component.html',
  styleUrls: ['./plannings-bulk-import-modal.component.scss'],
})
export class PlanningsBulkImportModalComponent implements OnInit, OnDestroy {
  @ViewChild('frame', { static: true }) frame;
  @ViewChild('xlsxPlannings', { static: false }) xlsxPlannings: ElementRef;
  @Output() importFinished = new EventEmitter<void>();
  xlsxPlanningsFileUploader: FileUploader = new FileUploader({
    url: '/api/items-planning-pn/plannings/import',
    authToken: this.authService.bearerToken,
  });
  xlsxFile: File;
  errors: { row: number; col: number; message: string }[];
  importSubscription$: Subscription;

  constructor(
    private toastrService: ToastrService,
    private translateService: TranslateService,
    private authService: AuthService,
    private loaderService: LoaderService,
    private planningService: ItemsPlanningPnPlanningsService
  ) {}

  ngOnDestroy(): void {}

  ngOnInit() {
    // todo maybe deprecated
    this.xlsxPlanningsFileUploader.onSuccessItem = (item, response) => {
      const model = JSON.parse(response).model;
      if (model) {
        this.errors = JSON.parse(response).model.errors;
        this.xlsxPlanningsFileUploader.clearQueue();
      }
      if (this.errors && this.errors.length > 0) {
        this.toastrService.warning(
          this.translateService.instant('Import has been finished partially')
        );
      } else {
        this.xlsxPlanningsFileUploader.clearQueue();
        this.toastrService.success(
          this.translateService.instant('Import has been finished successfully')
        );
        this.frame.hide();
      }
      this.loaderService.isLoading.next(false);
      this.xlsxPlannings.nativeElement.value = '';
      this.xlsxFile = null;
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

  show() {
    this.errors = [];
    this.xlsxFile = null;
    this.frame.show();
  }

  uploadExcelPlanningsFile(event) {
    this.xlsxPlanningsFileUploader.progress = 100;
    this.xlsxFile = event.target.files[0] as File;
    this.importSubscription$ = this.planningService
      .importPlanningsFromExcel(this.xlsxFile)
      .subscribe((result) => {
        if (result && result.success) {
          this.importFinished.emit();
          this.excelPlanningsModal();
        }
      });
  }

  excelPlanningsModal() {
    this.frame.hide();
    this.xlsxPlanningsFileUploader.clearQueue();
    this.xlsxFile = null;
  }
}
