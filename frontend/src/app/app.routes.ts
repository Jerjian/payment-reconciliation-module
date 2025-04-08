import { Routes } from '@angular/router';
import { PatientAccountStatementComponent } from './patient-account-statement/patient-account-statement.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { FinancialStatementComponent } from './financial-statement/financial-statement.component';

export const routes: Routes = [
  { path: '', redirectTo: '/patients', pathMatch: 'full' }, // Default route
  {
    path: 'patients',
    loadComponent: () =>
      import('./patient-list/patient-list.component').then(
        (m) => m.PatientListComponent
      ),
  },
  {
    path: 'patients/:id/account-statement',
    loadComponent: () =>
      import(
        './patient-account-statement/patient-account-statement.component'
      ).then((m) => m.PatientAccountStatementComponent),
  },
  // New Route for Prescription Detail
  {
    path: 'patients/:patientId/prescriptions/:rxNum',
    loadComponent: () =>
      import('./prescription-detail/prescription-detail.component').then(
        (m) => m.PrescriptionDetailComponent
      ),
  },
  {
    path: 'financial-statement',
    loadComponent: () =>
      import('./financial-statement/financial-statement.component').then(
        (m) => m.FinancialStatementComponent
      ),
  },
  // Add other routes here in the future
];
