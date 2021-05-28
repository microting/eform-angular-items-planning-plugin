import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import {
  ReportEformPnModel,
  ReportPnGenerateModel,
} from '../../../models/report';
import {
  ItemsPlanningPnReportsService,
  ItemsPlanningPnTagsService,
} from '../../../services';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { parseISO } from 'date-fns';
import { CasePostNewComponent } from 'src/app/modules/cases/components';
import {
  CasePostsListModel,
  CommonDictionaryModel,
  EmailRecipientTagCommonModel,
  SharedTagModel,
} from 'src/app/common/models';
import { EmailRecipientsService } from 'src/app/common/services';
import { PlanningsReportQuery } from '../store';
import { AuthStateService } from 'src/app/common/store';

@AutoUnsubscribe()
@Component({
  selector: 'app-items-planning-pn-report',
  templateUrl: './report-container.component.html',
  styleUrls: ['./report-container.component.scss'],
})
export class ReportContainerComponent implements OnInit, OnDestroy {
  reportsModel: ReportEformPnModel[] = [];
  dateFrom: any;
  dateTo: any;
  range: Date[] = [];
  @ViewChild('newPostModal') newPostModal: CasePostNewComponent;
  casePostsListModel: CasePostsListModel = new CasePostsListModel();
  availableEmailRecipientsAndTags: EmailRecipientTagCommonModel[] = [];
  availableEmailRecipients: CommonDictionaryModel[] = [];
  availableTags: SharedTagModel[] = [];
  currentUserFullName: string;
  selectedEformId: number;
  selectedCaseId: number;

  getTagsSub$: Subscription;
  getEmailsTagsSub$: Subscription;
  getRecipientsSub$: Subscription;
  generateReportSub$: Subscription;
  downloadReportSub$: Subscription;

  constructor(
    private emailRecipientsService: EmailRecipientsService,
    private activateRoute: ActivatedRoute,
    private reportService: ItemsPlanningPnReportsService,
    private toastrService: ToastrService,
    private router: Router,
    private tagsService: ItemsPlanningPnTagsService,
    private planningsReportQuery: PlanningsReportQuery,
    public authStateService: AuthStateService
  ) {
    this.activateRoute.params.subscribe((params) => {
      this.dateFrom = params['dateFrom'];
      this.dateTo = params['dateTo'];
      this.range.push(parseISO(params['dateFrom']));
      this.range.push(parseISO(params['dateTo']));
      const model = {
        dateFrom: params['dateFrom'],
        dateTo: params['dateTo'],
        tagIds: planningsReportQuery.pageSetting.filters.tagIds,
      };
      if (model.dateFrom !== undefined) {
        this.onGenerateReport(model);
      }
    });
  }

  ngOnInit() {
    this.getEmailRecipientsAndTags();
    this.getEmailRecipients();
    this.getTags();
  }

  getEmailRecipientsAndTags() {
    this.getEmailsTagsSub$ = this.emailRecipientsService
      .getEmailRecipientsAndTags()
      .subscribe((data) => {
        if (data && data.success) {
          this.availableEmailRecipientsAndTags = data.model;
        }
      });
  }

  getEmailRecipients() {
    this.getRecipientsSub$ = this.emailRecipientsService
      .getSimpleEmailRecipients()
      .subscribe((data) => {
        if (data && data.success) {
          this.availableEmailRecipients = data.model;
        }
      });
  }

  getTags() {
    this.getTagsSub$ = this.tagsService.getPlanningsTags().subscribe((data) => {
      if (data && data.success) {
        this.availableTags = data.model;
      }
    });
  }

  onGenerateReport(model: ReportPnGenerateModel) {
    this.dateFrom = model.dateFrom;
    this.dateTo = model.dateTo;
    this.generateReportSub$ = this.reportService
      .generateReport(model)
      .subscribe((data) => {
        if (data && data.success) {
          this.reportsModel = data.model;
        }
      });
  }

  onDownloadReport(model: ReportPnGenerateModel) {
    this.downloadReportSub$ = this.reportService
      .downloadReport(model)
      .subscribe(
        (data) => {
          saveAs(data, model.dateFrom + '_' + model.dateTo + '_report.docx');
        },
        (_) => {
          this.toastrService.error('Error downloading report');
        }
      );
  }

  ngOnDestroy(): void {}

  postDoneRedirect() {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() =>
        this.router.navigate([
          '/plugins/items-planning-pn/reports/' +
            this.dateFrom +
            '/' +
            this.dateTo,
        ])
      );
  }
}
