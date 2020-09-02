import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ReportEformItemModel} from '../../../models/report';

@Component({
  selector: 'app-report-table',
  templateUrl: './report-table.component.html',
  styleUrls: ['./report-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportTableComponent implements OnInit {
  @Input() items: ReportEformItemModel[] = [];
  @Input() dateFrom: any;
  @Input() dateTo: any;
  @Input() itemHeaders: {key: string, value: string}[] = [];
  constructor() { }

  ngOnInit(): void {
  }

}
