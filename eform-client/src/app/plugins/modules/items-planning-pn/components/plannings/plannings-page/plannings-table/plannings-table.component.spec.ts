import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningsTableComponent } from './plannings-table.component';

describe('PlanningsTableComponent', () => {
  let component: PlanningsTableComponent;
  let fixture: ComponentFixture<PlanningsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanningsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
