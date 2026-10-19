import {ComponentFixture, TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TranslateModule} from '@ngx-translate/core';
import {PairingGridUpdateComponent} from './pairing-grid-update.component';

describe('PairingGridUpdateComponent', () => {
  let component: PairingGridUpdateComponent;
  let fixture: ComponentFixture<PairingGridUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PairingGridUpdateComponent, TranslateModule.forRoot()],
      providers: [
        {provide: MatDialogRef, useValue: {close: vi.fn()}},
        {provide: MAT_DIALOG_DATA, useValue: [{paired: true}, {paired: false}, {paired: false}]},
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PairingGridUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should split the pairings into deploy and retract', () => {
    expect(component.pairingsForDeploy.length).toBe(1);
    expect(component.pairingsForRetract.length).toBe(2);
  });
});
