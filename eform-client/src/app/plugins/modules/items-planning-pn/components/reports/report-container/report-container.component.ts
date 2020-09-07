import {AfterContentInit, AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {saveAs} from 'file-saver';
import {ToastrService} from 'ngx-toastr';
import {ReportEformItemModel, ReportEformPnModel, ReportEformPostModel, ReportPnGenerateModel} from '../../../models/report';
import {ItemsPlanningPnReportsService} from '../../../services';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import { parseISO } from 'date-fns';
import {CasePostNewComponent} from 'src/app/modules/cases/components';
import {CasePostsListModel, CommonDictionaryModel, EmailRecipientTagCommonModel} from 'src/app/common/models';
import {EmailRecipientsService} from 'src/app/common/services';

@AutoUnsubscribe()
@Component({
  selector: 'app-items-planning-pn-report',
  templateUrl: './report-container.component.html',
  styleUrls: ['./report-container.component.scss']
})
export class ReportContainerComponent implements OnInit, OnDestroy {
  reportsModel: ReportEformPnModel[] = [];
  generateReportSub$: Subscription;
  downloadReportSub$: Subscription;
  dateFrom: any;
  dateTo: any;
  range: Date[] = [];
  @ViewChild('newPostModal') newPostModal: CasePostNewComponent;
  casePostsListModel: CasePostsListModel = new CasePostsListModel();
  availableRecipientsAndTags: EmailRecipientTagCommonModel[] = [];
  availableRecipients: CommonDictionaryModel[] = [];
  getTagsSub$: Subscription;
  getRecipientsSub$: Subscription;
  currentUserFullName: string;
  selectedEformId: number;
  selectedCaseId: number;

  constructor(
    private emailRecipientsService: EmailRecipientsService,
    private activateRoute: ActivatedRoute,
    private reportService: ItemsPlanningPnReportsService,
    private toastrService: ToastrService,
    private router: Router) {
    this.activateRoute.params.subscribe(params => {
      this.dateFrom = params['dateFrom'];
      this.dateTo = params['dateTo'];
      this.range.push(parseISO(params['dateFrom']));
      this.range.push(parseISO(params['dateTo']));
      const model = {
        dateFrom: params['dateFrom'],
        dateTo: params['dateTo']
      };
      if (model.dateFrom !== undefined) {
        this.onGenerateReport(model);
      }
    });
  }

  ngOnInit() {
    // this.reportsModel = [...testData];
    this.getRecipientsAndTags();
    this.getRecipients();
  }

  getRecipientsAndTags() {
    this.getTagsSub$ = this.emailRecipientsService.getEmailRecipientsAndTags().subscribe((data) => {
      if (data && data.success) {
        this.availableRecipientsAndTags = data.model;
      }
    });
  }

  getRecipients() {
    this.getRecipientsSub$ = this.emailRecipientsService.getSimpleEmailRecipients().subscribe((data) => {
      if (data && data.success) {
        this.availableRecipients = data.model;
      }
    });
  }

  onGenerateReport(model: ReportPnGenerateModel) {
    this.dateFrom = model.dateFrom;
    this.dateTo = model.dateTo;
    this.generateReportSub$ = this.reportService.generateReport(model).subscribe((data) => {
      if (data && data.success) {
        this.reportsModel = data.model;
      }
    });
  }

  onDownloadReport(model: ReportPnGenerateModel) {
    this.downloadReportSub$ = this.reportService.downloadReport(model).subscribe(((data) => {
      saveAs(data, model.dateFrom + '_' + model.dateTo + '_report.docx');
    }), error => {
      this.toastrService.error('Error downloading report');
    });
  }

  ngOnDestroy(): void {

  }

  postDoneRedirect() {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
      this.router.navigate(['/plugins/items-planning-pn/reports/' + this.dateFrom + '/' + this.dateTo]));
  }
}
