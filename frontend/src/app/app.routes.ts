import { Routes } from '@angular/router';
import { PatientAccountStatementComponent } from './patient-account-statement/patient-account-statement.component';
import { PatientListComponent } from './patient-list/patient-list.component';

export const routes: Routes = [
  {
    path: 'patients',
    component: PatientListComponent,
  },
  {
    path: 'patients/:id/account-statement',
    component: PatientAccountStatementComponent,
  },
  // Add other routes here in the future
];
