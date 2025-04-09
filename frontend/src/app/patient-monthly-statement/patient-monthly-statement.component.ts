import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ApiService,
  PatientMonthlyStatement,
  PatientDetails,
} from '../services/api.service';
import { Observable, Subscription, of, forkJoin, BehaviorSubject } from 'rxjs';
import { switchMap, catchError, tap, map } from 'rxjs/operators';
import { format } from 'date-fns';

@Component({
  selector: 'app-patient-monthly-statement',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-monthly-statement.component.html',
  styleUrl: './patient-monthly-statement.component.scss',
})
export class PatientMonthlyStatementComponent implements OnInit, OnDestroy {
  private viewDataSubject = new BehaviorSubject<{
    statements: PatientMonthlyStatement[] | null;
    patientName: string | null;
  }>({ statements: null, patientName: null });
  viewData$ = this.viewDataSubject.asObservable();

  patientId: number | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  private routeSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router
  ) {
    this.routeSub = this.route.paramMap
      .pipe(
        tap((params) => {
          const id = params.get('id');
          if (id) {
            this.patientId = +id;
            this.isLoading = true;
            this.error = null;
            this.viewDataSubject.next({ statements: null, patientName: null });
          } else {
            this.error = 'Patient ID not found in URL.';
            this.patientId = null;
            this.isLoading = false;
          }
        }),
        switchMap(() => {
          if (this.patientId) {
            return forkJoin({
              details: this.apiService.getPatientDetails(this.patientId),
              statements: this.apiService.getPatientMonthlyStatements(
                this.patientId
              ),
            }).pipe(
              map(({ details, statements }) => {
                const name = details
                  ? `${details.FirstName} ${details.LastName}`
                  : 'Unknown Patient';
                return { statements: statements, patientName: name };
              }),
              catchError((err) => {
                console.error('Error loading patient data or statements:', err);
                this.error = `Failed to load data: ${
                  err.message || 'Unknown error'
                }`;
                return of({ statements: null, patientName: null });
              })
            );
          } else {
            return of({ statements: null, patientName: null });
          }
        }),
        tap((data) => {
          this.viewDataSubject.next(data);
          this.isLoading = false;
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    // Logic is now in the constructor's pipe
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  goBack(): void {
    if (this.patientId) {
      this.router.navigate(['/patients', this.patientId, 'account-statement']);
    } else {
      this.router.navigate(['/patients']);
    }
  }

  formatDateRange(startDate: string | Date, endDate: string | Date): string {
    return `${format(new Date(startDate), 'yyyy-MM-dd')} to ${format(
      new Date(endDate),
      'yyyy-MM-dd'
    )}`;
  }
}
