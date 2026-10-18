import {ComponentFixture, TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {of} from 'rxjs';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {TranslateModule} from '@ngx-translate/core';
import {PlanningsHeaderComponent} from './plannings-header.component';
import {PlanningsStateService} from '../../store';

describe('PlanningsHeaderComponent', () => {
  let component: PlanningsHeaderComponent;
  let fixture: ComponentFixture<PlanningsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningsHeaderComponent, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        {provide: Store, useValue: {select: vi.fn(() => of(null)), dispatch: vi.fn()}},
        {provide: PlanningsStateService, useValue: {}},
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PlanningsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
