import {ComponentFixture, TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TranslateModule} from '@ngx-translate/core';
import {PlanningFoldersModalComponent} from './planning-folders-modal.component';

describe('PlanningFoldersModalComponent', () => {
  let component: PlanningFoldersModalComponent;
  let fixture: ComponentFixture<PlanningFoldersModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningFoldersModalComponent, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        {provide: MatDialogRef, useValue: {close: vi.fn()}},
        {provide: MAT_DIALOG_DATA, useValue: {folders: [], planningModel: undefined}},
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PlanningFoldersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
