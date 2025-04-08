import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAccountStatementComponent } from './patient-account-statement.component';

describe('PatientAccountStatementComponent', () => {
  let component: PatientAccountStatementComponent;
  let fixture: ComponentFixture<PatientAccountStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientAccountStatementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientAccountStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
