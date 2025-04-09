import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, FinancialStatementData } from '../services/api.service';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import {
  catchError,
  switchMap,
  tap,
  finalize,
  distinctUntilChanged,
} from 'rxjs/operators';

@Component({
  selector: 'app-financial-statement',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './financial-statement.component.html',
  styleUrl: './financial-statement.component.scss',
})
export class FinancialStatementComponent implements OnInit {
  selectedYearSubject = new BehaviorSubject<number>(new Date().getFullYear());
  selectedMonthSubject = new BehaviorSubject<number>(new Date().getMonth() + 1);

  statementData$: Observable<FinancialStatementData | null>;

  isLoading: boolean = false;
  error: string | null = null;

  availableYears: number[] = [];
  availableMonths: { value: number; name: string }[] = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  get selectedYear(): number {
    return this.selectedYearSubject.value;
  }
  set selectedYear(value: number) {
    this.selectedYearSubject.next(value);
  }
  get selectedMonth(): number {
    return this.selectedMonthSubject.value;
  }
  set selectedMonth(value: number) {
    this.selectedMonthSubject.next(value);
  }

  constructor(private apiService: ApiService, private router: Router) {
    this.populateYears();

    this.statementData$ = combineLatest([
      this.selectedYearSubject.pipe(distinctUntilChanged()),
      this.selectedMonthSubject.pipe(distinctUntilChanged()),
    ]).pipe(
      tap(() => {
        setTimeout(() => {
          this.isLoading = true;
          this.error = null;
        }, 0);
      }),
      switchMap(([year, month]) =>
        this.apiService.getFinancialStatement(year, month).pipe(
          catchError((err) => {
            console.error('Error loading financial statement:', err);
            setTimeout(() => {
              this.error = `Failed to load financial statement for ${month}/${year}: ${
                err.message || 'Unknown error'
              }`;
            }, 0);
            return of(null);
          }),
          finalize(() => {
            setTimeout(() => {
              this.isLoading = false;
            }, 0);
          })
        )
      )
    );
  }

  ngOnInit(): void {}

  populateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      this.availableYears.push(currentYear - i);
    }
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }
}
