import {ComponentFixture, TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {of} from 'rxjs';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {TranslateModule} from '@ngx-translate/core';
import {PlanningsBulkImportModalComponent} from './plannings-bulk-import-modal.component';
import {LoaderService} from 'src/app/common/services/loader.service';
import {AuthStateService} from 'src/app/common/store';

describe('PlanningsBulkImportModalComponent', () => {
  let component: PlanningsBulkImportModalComponent;
  let fixture: ComponentFixture<PlanningsBulkImportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningsBulkImportModalComponent, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        {provide: Store, useValue: {select: vi.fn(() => of('token')), dispatch: vi.fn()}},
        {provide: ToastrService, useValue: {success: vi.fn(), warning: vi.fn(), error: vi.fn()}},
        {provide: LoaderService, useValue: {isLoading: of(false), setLoading: vi.fn()}},
        {provide: AuthStateService, useValue: {}},
        {provide: MatDialogRef, useValue: {close: vi.fn()}},
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PlanningsBulkImportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
