import {ComponentFixture, TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {of} from 'rxjs';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {TranslateModule} from '@ngx-translate/core';
import {PairingGridTableComponent} from './pairing-grid-table.component';
import {PairingStateService} from '../store';
import {ItemsPlanningPnTagsService} from '../../../../services';
import {AuthStateService} from 'src/app/common/store';
import {SitesService} from 'src/app/common/services';
import {PairingsModel} from '../../../../models';

describe('PairingGridTableComponent', () => {
  let component: PairingGridTableComponent;
  let fixture: ComponentFixture<PairingGridTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PairingGridTableComponent, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        {provide: Store, useValue: {select: vi.fn(() => of(null)), dispatch: vi.fn()}},
        {provide: AuthStateService, useValue: {}},
        {provide: PairingStateService, useValue: {}},
        {provide: SitesService, useValue: {getAllSitesForPairing: vi.fn(() => of(null))}},
        {provide: ItemsPlanningPnTagsService, useValue: {getPlanningsTags: vi.fn(() => of(null))}},
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PairingGridTableComponent);
    component = fixture.componentInstance;
    component.pairingsModel = new PairingsModel();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
