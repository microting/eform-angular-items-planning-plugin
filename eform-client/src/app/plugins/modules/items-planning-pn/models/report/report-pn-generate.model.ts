export class ReportPnGenerateModel {
  dateTo: string;
  dateFrom: string;

  constructor(data?: any) {
    if (data) {
      this.dateTo = data.dateTo;
      this.dateFrom = data.dateFrom;
    }
  }
}
