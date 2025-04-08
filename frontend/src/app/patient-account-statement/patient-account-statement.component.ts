import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService, PatientAccountStatement } from '../services/api.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-patient-account-statement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-account-statement.component.html',
  styleUrl: './patient-account-statement.component.scss',
})
export class PatientAccountStatementComponent implements OnInit {
  accountStatement$: Observable<PatientAccountStatement> | undefined;
  patientId: number | null = null;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.patientId = +idParam;
      this.loadAccountStatement();
    } else {
      console.error('Patient ID not found in route');
      this.error = 'Patient ID is missing from the URL.';
    }
  }

  loadAccountStatement(): void {
    if (this.patientId !== null) {
      this.accountStatement$ = this.apiService.getPatientAccountStatement(
        this.patientId
      );
      this.accountStatement$.subscribe({
        error: (err) => {
          console.error('Error loading account statement:', err);
          this.error = `Failed to load account statement: ${err.message}`;
          this.accountStatement$ = undefined;
        },
      });
    }
  }
}
