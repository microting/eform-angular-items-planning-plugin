import {ComponentFixture, TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {of} from 'rxjs';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Overlay} from '@angular/cdk/overlay';
import {Store} from '@ngrx/store';
import {TranslateModule} from '@ngx-translate/core';
import {PairingGridPageComponent} from './pairing-grid-page.component';
import {PairingStateService} from '../store';
import {AppMenuStateService, AuthStateService} from 'src/app/common/store';
import {SitesService, TitleService} from 'src/app/common/services';
import {ItemsPlanningPnTagsService} from '../../../../services';
import {ItemsPlanningPnPairingService} from '../../../../services';

describe('PairingGridPageComponent', () => {
  let component: PairingGridPageComponent;
  let fixture: ComponentFixture<PairingGridPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PairingGridPageComponent, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        // the page embeds the subheader and the grid table; stub what they inject
        {provide: AppMenuStateService, useValue: {}},
        {provide: AuthStateService, useValue: {}},
        {provide: SitesService, useValue: {}},
        {provide: ItemsPlanningPnTagsService, useValue: {getPlanningsTags: vi.fn(() => of(null))}},
        {provide: TitleService, useValue: {setTitle: vi.fn()}},
        {provide: Store, useValue: {select: vi.fn(() => of(null)), dispatch: vi.fn()}},
        {provide: ItemsPlanningPnPairingService, useValue: {updatePairings: vi.fn()}},
        {provide: PairingStateService, useValue: {getAllPairings: vi.fn(() => of(null))}},
        {provide: MatDialog, useValue: {open: vi.fn()}},
        {provide: Overlay, useValue: {}},
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PairingGridPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
