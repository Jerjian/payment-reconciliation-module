import { Routes } from '@angular/router';
import { PatientAccountStatementComponent } from './patient-account-statement/patient-account-statement.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { FinancialStatementComponent } from './financial-statement/financial-statement.component';

export const routes: Routes = [
  {
    path: 'patients',
    component: PatientListComponent,
  },
  {
    path: 'patients/:id/account-statement',
    component: PatientAccountStatementComponent,
  },
  {
    path: 'financial-statement',
    component: FinancialStatementComponent,
  },
  // Add other routes here in the future
];
