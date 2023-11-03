import {Component, OnDestroy, OnInit} from '@angular/core';
import {saveAs} from 'file-saver';
import {ToastrService} from 'ngx-toastr';
import {
  ReportEformPnModel,
  ReportPnGenerateModel,
} from '../../../../models';
import {
  ItemsPlanningPnReportsService,
  ItemsPlanningPnTagsService,
} from '../../../../services';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {BehaviorSubject, forkJoin, Observable, Subscription, asyncScheduler} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {format, parseISO} from 'date-fns';
import {
  CasePostsListModel,
  CommonDictionaryModel,
  EmailRecipientTagCommonModel,
  SharedTagModel,
} from 'src/app/common/models';
import {EmailRecipientsService, TemplateFilesService} from 'src/app/common/services';
import {AuthStateService} from 'src/app/common/store';
import {Gallery, GalleryItem, ImageItem} from '@ngx-gallery/core';
import {Lightbox} from '@ngx-gallery/lightbox';
import {ViewportScroller} from '@angular/common';
import {Store} from '@ngrx/store';
import {PlanningsState} from 'src/app/plugins/modules/items-planning-pn/state/plannings/plannings.reducer';
import {
  selectReportsFilters,
  selectReportsScrollPosition
} from 'src/app/plugins/modules/items-planning-pn/state/reports/reports.selector';

@AutoUnsubscribe()
@Component({
  selector: 'app-items-planning-pn-report',
  templateUrl: './report-container.component.html',
  styleUrls: ['./report-container.component.scss'],
})
export class ReportContainerComponent implements OnInit, OnDestroy {
  // @ViewChild('newPostModal') newPostModal: CasePostNewComponent;
  reportsModel: ReportEformPnModel[] = [];
  range: Date[] = [];
  casePostsListModel: CasePostsListModel = new CasePostsListModel();
  availableEmailRecipientsAndTags: EmailRecipientTagCommonModel[] = [];
  availableEmailRecipients: CommonDictionaryModel[] = [];
  availableTags: SharedTagModel[] = [];
  currentUserFullName: string;
  selectedEformId: number;
  selectedCaseId: number;
  images: { key: number, value: any }[] = [];
  galleryImages: GalleryItem[] = [];
  isDescriptionBlockCollapsed = new Array<boolean>();
  dateFrom: any;
  dateTo: any;
  startWithParams = false;
  private observableReportsModel = new BehaviorSubject<ReportEformPnModel[]>([]);
  // @ts-ignore
  private selectReportsFilters$ = this.planningStore.select(selectReportsFilters);
  // @ts-ignore
  private selectReportsScrollPosition$ = this.planningStore.select(selectReportsScrollPosition);

  getTagsSub$: Subscription;
  // getEmailsTagsSub$: Subscription;
  // getRecipientsSub$: Subscription;
  generateReportSub$: Subscription;
  downloadReportSub$: Subscription;
  imageSub$: Subscription[] = [];

  constructor(
    private emailRecipientsService: EmailRecipientsService,
    private activateRoute: ActivatedRoute,
    private reportService: ItemsPlanningPnReportsService,
    private toastrService: ToastrService,
    private router: Router,
    private tagsService: ItemsPlanningPnTagsService,
    private planningStore: Store<PlanningsState>,
    public authStateService: AuthStateService,
    public gallery: Gallery,
    public lightbox: Lightbox,
    private imageService: TemplateFilesService,
    private viewportScroller: ViewportScroller
  ) {
    this.activateRoute.params.subscribe((params) => {
      this.dateFrom = params['dateFrom'];
      this.dateTo = params['dateTo'];
      this.range.push(parseISO(params['dateFrom']));
      this.range.push(parseISO(params['dateTo']));
      this.startWithParams = !!(this.dateTo && this.dateFrom);
      let tagsIds: number[] = [];
      this.selectReportsFilters$.subscribe((filters) => {
        if (filters === undefined) {
          return;
        }
        tagsIds = filters.tagIds;
      }).unsubscribe();
      const model = {
        dateFrom: params['dateFrom'],
        dateTo: params['dateTo'],
        tagIds: tagsIds,
        type: ''
      };
      if (model.dateFrom !== undefined) {
        this.onGenerateReport(model);
      }
    });
    this.observableReportsModel.subscribe(x => {
      if(x.length && this.startWithParams){
        const task = (_: any) => this.selectReportsScrollPosition$
          .subscribe(value => this.viewportScroller.scrollToPosition(value));
        asyncScheduler.schedule(task, 1000);
        this.startWithParams = false;
      }
    })
  }

  ngOnInit() {
    this.getTags();
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
    let tagsIds: number[] = [];
    this.selectReportsFilters$.subscribe((filters) => {
      if (filters === undefined) {
        return;
      }
      tagsIds = filters.tagIds;
    }).unsubscribe();
    this.generateReportSub$ = this.reportService
      .generateReport({
        dateFrom: model.dateFrom,
        dateTo: model.dateTo,
        tagIds: tagsIds,
        type: ''
      })
      .subscribe((data) => {
        if (data && data.success) {
          this.reportsModel = data.model;
          this.isDescriptionBlockCollapsed = this.reportsModel.map(_ => {
            return true;
          })
          this.observableReportsModel.next(data.model);
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

  onDownloadExcelReport(model: ReportPnGenerateModel) {
    this.downloadReportSub$ = this.reportService
      .downloadReport(model)
      .subscribe(
        (data: string | Blob) => {
          saveAs(data, model.dateFrom + '_' + model.dateTo + '_report.xlsx');
        },
        (_) => {
          this.toastrService.error('Error downloading report');
        }
      );
  }

  postDoneRedirect() {
    this.router
      .navigateByUrl('/', {skipLocationChange: true})
      .then(() =>
        this.router.navigate([
          '/plugins/items-planning-pn/reports/' +
          this.dateFrom +
          '/' +
          this.dateTo,
        ])
      );
  }

  onPlanningCaseDeleted() {
    const model = {
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      tagIds: [],
      type: ''
    };
    if (model.dateFrom !== undefined) {
      this.onGenerateReport(model);
    }
  }

  getImages(reportEformPnModel: ReportEformPnModel, caseId: number) {
    this.images = [];
    const observables: Observable<any>[] = []
    const length = reportEformPnModel.imageNames.filter(x => x.key[0] === caseId.toString()).length;
    reportEformPnModel.imageNames.filter(x => x.key[0] === caseId.toString())
      .forEach((imageValue) => {
        observables.push(this.imageService.getImage(imageValue.value[0]))
        if(length === observables.length) {
          this.imageSub$.push(forkJoin(observables).subscribe(blobArr => {
            if (length === blobArr.length) {
              blobArr.forEach((blob, index) => {
                const imageUrl = URL.createObjectURL(blob);
                const val = {
                  src: imageUrl,
                  thumbnail: imageUrl,
                  fileName: imageValue.value[0],
                  name: imageValue.key[1],
                  geoTag: imageValue.value[1]
                };
                this.images.push({key: Number(imageValue.key[0]), value: val});
                this.images.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
                if (index + 1 === blobArr.length) {
                  this.updateGallery();
                  this.openPicture(0);
                }
              });
            }
          }));
        }
    });
  }

  updateGallery() {
    this.galleryImages = this.images.map(value => new ImageItem({src: value.value.src, thumb: value.value.thumbnail}));
  }

  openPicture(i: any) {
    if (this.galleryImages.length > 1) {
      this.gallery.ref('lightbox', {counterPosition: 'bottom', loadingMode: 'indeterminate'}).load(this.galleryImages);
      this.lightbox.open(i);
    } else {
      this.gallery.ref('lightbox', {counter: false, loadingMode: 'indeterminate'}).load(this.galleryImages);
      this.lightbox.open(i);
    }
  }

  onClickViewPicture(model: {reportIndex: number, caseId: number }){
    const reportEformPnModel = this.reportsModel[model.reportIndex];
    this.getImages(reportEformPnModel, model.caseId);
  }

  toggleCollapse(i: number) {
    this.isDescriptionBlockCollapsed[i] = !this.isDescriptionBlockCollapsed[i];
    // this.collapses.forEach((collapse: CollapseComponent, index) => {
    //   if(index === i) {
    //     collapse.toggle();
    //   }
    // });
  }

  ngOnDestroy(): void {
    this.imageSub$.forEach(sub => sub.unsubscribe());
  }
}
