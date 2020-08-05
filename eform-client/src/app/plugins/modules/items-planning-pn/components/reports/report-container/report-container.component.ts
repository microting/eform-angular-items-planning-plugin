import {Component, OnDestroy, OnInit} from '@angular/core';
import {saveAs} from 'file-saver';
import {ToastrService} from 'ngx-toastr';
import {ReportEformItemModel, ReportEformPnModel, ReportEformPostModel, ReportPnGenerateModel} from '../../../models/report';
import {ItemsPlanningPnReportsService} from '../../../services';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {Subscription} from 'rxjs';

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

  constructor(private reportService: ItemsPlanningPnReportsService, private toastrService: ToastrService) {
  }

  ngOnInit() {
    // this.reportsModel = [...testData];
  }

  onGenerateReport(model: ReportPnGenerateModel) {
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
}

const testData = [
  {
    name: 'Test Eform 1',
    itemHeaders: ['Header 1', 'Header 2', 'Header 3', 'Header 4'],
    items: [
      {
        id: 1,
        createdAt: '2019/02/02',
        doneBy: 'Not Ukrainian',
        itemName: 'Hey Item',
        caseFields: ['Field 1', 'Field 2', 'Field 3', 'Field 4'],
        imagesCount: 0,
        postsCount: 0
      },
      {
        id: 1,
        createdAt: '2019/02/02',
        doneBy: 'Not Ukrainian',
        itemName: 'Hey Item',
        caseFields: ['Field 1', 'Field 2', 'Field 3', 'Field 4'],
        imagesCount: 0,
        postsCount: 0
      },
      {
        id: 1,
        createdAt: '2019/02/02',
        doneBy: 'Not Ukrainian',
        itemName: 'Hey Item',
        caseFields: ['Field 1', 'Field 2', 'Field 3', 'Field 4'],
        imagesCount: 0,
        postsCount: 0
      }
    ],
    imagesNames: [],
    posts: [
      {
        postId: 1,
        caseId: 2,
        sentTo: ['John Smith', 'Terry Kim'],
        comment: 'Im funny comment as heck'
      },
      {
        postId: 1,
        caseId: 2,
        sentTo: ['John Smith', 'Terry Kim'],
        comment: 'Im funny comment as heck'
      },
      {
        postId: 1,
        caseId: 2,
        sentTo: ['John Smith', 'Terry Kim'],
        comment: 'Im funny comment as heck'
      },
      {
        postId: 1,
        caseId: 2,
        sentTo: ['John Smith', 'Terry Kim'],
        comment: 'Im funny comment as heck'
      }
    ],
  }
];
