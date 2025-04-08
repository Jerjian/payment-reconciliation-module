import { Routes } from '@angular/router';
import { PatientAccountStatementComponent } from './patient-account-statement/patient-account-statement.component';

export const routes: Routes = [
  {
    path: 'patients/:id/account-statement',
    component: PatientAccountStatementComponent,
  },
  // Add other routes here in the future
];
