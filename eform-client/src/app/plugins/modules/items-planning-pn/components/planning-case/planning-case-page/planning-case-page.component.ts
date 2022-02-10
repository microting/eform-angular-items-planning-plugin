import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EFormService, CasesService } from 'src/app/common/services';
import {
  TemplateDto,
  CaseEditRequest,
  ReplyElementDto,
  ReplyRequest,
} from 'src/app/common/models';
import { AuthStateService } from 'src/app/common/store';
import { CaseEditElementComponent } from 'src/app/common/modules/eform-cases/components';
import {ItemsPlanningPnCasesService} from 'src/app/plugins/modules/items-planning-pn/services';
import {DateTimeAdapter} from '@danielmoncada/angular-datetime-picker';

@Component({
  selector: 'app-installation-case-page',
  templateUrl: './planning-case-page.component.html',
  styleUrls: ['./planning-case-page.component.scss'],
})
export class PlanningCasePageComponent implements OnInit {
  @ViewChildren(CaseEditElementComponent)
  editElements: QueryList<CaseEditElementComponent>;
  @ViewChild('caseConfirmation', { static: false }) caseConfirmation;
  id: number;
  planningId: number;
  eFormId: number;
  dateFrom: string;
  dateTo: string;
  currenteForm: TemplateDto = new TemplateDto();
  replyElement: ReplyElementDto = new ReplyElementDto();
  reverseRoute: string;
  requestModels: Array<CaseEditRequest> = [];
  replyRequest: ReplyRequest = new ReplyRequest();
  maxDate: Date;

  get userClaims() {
    return this.authStateService.currentUserClaims;
  }

  constructor(
    dateTimeAdapter: DateTimeAdapter<any>,
    private activateRoute: ActivatedRoute,
    private casesService: CasesService,
    private eFormService: EFormService,
    private router: Router,
    private authStateService: AuthStateService,
    private itemsPlanningPnCasesService: ItemsPlanningPnCasesService
  ) {
    this.activateRoute.params.subscribe((params) => {
      this.id = +params['id'];
      this.planningId = +params['planningId'];
      this.eFormId = +params['templateId'];
      this.dateFrom = params['dateFrom'];
      this.dateTo = params['dateTo'];
      dateTimeAdapter.setLocale(authStateService.currentUserLocale);
    });
  }

  ngOnInit() {
    this.loadTemplateInfo();
    this.maxDate = new Date();
  }

  loadCase() {
    if (!this.id || this.id === 0) {
      return;
    }
    this.casesService
      .getById(this.id, this.currenteForm.id)
      .subscribe((operation) => {
        if (operation && operation.success) {
          this.replyElement = operation.model;
        }
      });
  }

  loadTemplateInfo() {
    if (this.eFormId) {
      this.eFormService.getSingle(this.eFormId).subscribe((operation) => {
        if (operation && operation.success) {
          this.currenteForm = operation.model;
          this.loadCase();
        }
      });
    }
  }

  saveCase(navigateToPosts?: boolean) {
    this.requestModels = [];
    this.editElements.forEach((x) => {
      x.extractData();
      this.requestModels.push(x.requestModel);
    });
    this.replyRequest.id = this.replyElement.id;
    this.replyRequest.label = this.replyElement.label;
    this.replyRequest.elementList = this.requestModels;
    this.replyRequest.doneAt = this.replyElement.doneAt;
    this.itemsPlanningPnCasesService
      .updateCase(this.replyRequest, this.currenteForm.id)
      .subscribe((operation) => {
        if (operation && operation.success) {
          this.replyElement = new ReplyElementDto();
          this.router
            .navigate([
              '/plugins/items-planning-pn/reports/' +
                this.dateFrom +
                '/' +
                this.dateTo,
            ])
            .then();
        }
      });
  }

  goToSection(location: string): void {
    window.location.hash = location;
    setTimeout(() => {
      document.querySelector(location).parentElement.scrollIntoView();
    });
  }
}
