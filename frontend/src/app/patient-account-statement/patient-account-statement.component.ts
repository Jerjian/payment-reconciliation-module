import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ApiService,
  PatientAccountStatement,
  StatementLine,
} from '../services/api.service';
import {
  Observable,
  BehaviorSubject,
  Subscription,
  combineLatest,
  of,
} from 'rxjs';
import {
  map,
  startWith,
  debounceTime,
  distinctUntilChanged,
  tap,
  catchError,
} from 'rxjs/operators';

// Define the type for sortable columns
type SortableColumn = 'RxNum' | 'TherapyName' | 'Balance';

@Component({
  selector: 'app-patient-account-statement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patient-account-statement.component.html',
  styleUrl: './patient-account-statement.component.scss',
})
export class PatientAccountStatementComponent implements OnInit, OnDestroy {
  // Hold the raw statement fetched from API
  private rawStatementSubject =
    new BehaviorSubject<PatientAccountStatement | null>(null);
  rawStatement$ = this.rawStatementSubject.asObservable();

  // Subject for search term changes
  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject
    .asObservable()
    .pipe(debounceTime(300), distinctUntilChanged()); // Apply debounce/distinct here

  // Subject for sort state
  private sortStateSubject = new BehaviorSubject<{
    column: SortableColumn | null;
    direction: 'asc' | 'desc';
  }>({ column: 'RxNum', direction: 'asc' });
  sortState$ = this.sortStateSubject.asObservable();

  // Observable for the final view model
  viewModel$: Observable<{
    patientDetails: any;
    totalBalance: string;
    filteredLines: StatementLine[];
    totalResults: number;
    displayedResults: number;
  } | null>;

  patientId: number | null = null;
  error: string | null = null;
  isLoading: boolean = false;

  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router
  ) {
    // Combine raw data, search term, and sort state
    this.viewModel$ = combineLatest([
      this.rawStatement$,
      this.searchTerm$.pipe(startWith('')), // Ensure search term starts with empty string
      this.sortState$,
    ]).pipe(
      map(([statement, term, sortState]) => {
        if (!statement) {
          return null;
        }

        // 1. Filter based on search term
        const lowerSearchTerm = term.toLowerCase().trim();
        let filteredLines = statement.statementLines || [];
        if (lowerSearchTerm) {
          filteredLines = filteredLines.filter(
            (line) =>
              line.RxNum.toString().includes(lowerSearchTerm) ||
              line.TherapyName.toLowerCase().includes(lowerSearchTerm)
          );
        }

        // 2. Sort based on sortState
        if (sortState.column) {
          filteredLines.sort((a, b) => {
            // Initialize variables to satisfy linter
            let valA: string | number = 0;
            let valB: string | number = 0;

            switch (sortState.column) {
              case 'RxNum':
                valA = a.RxNum;
                valB = b.RxNum;
                break;
              case 'TherapyName':
                valA = a.TherapyName.toLowerCase();
                valB = b.TherapyName.toLowerCase();
                break;
              case 'Balance':
                valA = parseFloat(a.Balance);
                valB = parseFloat(b.Balance);
                break;
            }

            let comparison = 0;
            if (valA > valB) {
              comparison = 1;
            } else if (valA < valB) {
              comparison = -1;
            }

            return sortState.direction === 'asc' ? comparison : comparison * -1;
          });
        }

        return {
          patientDetails: statement.patientDetails,
          totalBalance: statement.TotalBalance,
          filteredLines: filteredLines, // Now filtered and sorted
          totalResults: statement.statementLines.length,
          displayedResults: filteredLines.length,
        };
      })
    );
  }

  ngOnInit(): void {
    // Reset sort state to default on component initialization
    this.sortStateSubject.next({ column: 'RxNum', direction: 'asc' });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.patientId = +idParam;
      this.loadAccountStatement();
    } else {
      console.error('Patient ID not found in route');
      this.error = 'Patient ID is missing from the URL.';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadAccountStatement(): void {
    if (this.patientId !== null) {
      this.isLoading = true;
      this.error = null;
      this.rawStatementSubject.next(null);

      this.subscriptions.add(
        this.apiService
          .getPatientAccountStatement(this.patientId)
          .pipe(
            tap((statement) => {
              this.rawStatementSubject.next(statement);
              this.isLoading = false;
            }),
            catchError((err) => {
              console.error('Error loading account statement:', err);
              this.error = `Failed to load account statement: ${
                err.message || 'Unknown error'
              }`;
              this.rawStatementSubject.next(null);
              this.isLoading = false;
              return of(null);
            })
          )
          .subscribe()
      );
    }
  }

  // Method to update search term subject
  onSearchTermChange(term: string): void {
    this.searchTermSubject.next(term);
  }

  // Method to apply sorting
  applySort(column: SortableColumn): void {
    const currentSortState = this.sortStateSubject.value;
    let nextDirection: 'asc' | 'desc' = 'asc';

    if (currentSortState.column === column) {
      // Toggle direction if same column
      nextDirection = currentSortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Reset to ascending for new column
      nextDirection = 'asc';
    }

    this.sortStateSubject.next({ column: column, direction: nextDirection });
  }

  // Helper to get the correct sort icon
  getSortIcon(
    column: SortableColumn,
    state: { column: SortableColumn | null; direction: 'asc' | 'desc' }
  ): string {
    if (state.column !== column) {
      return '\u21F5'; // Up-down arrow (default)
    }
    return state.direction === 'asc' ? '\u2191' : '\u2193'; // Up arrow or Down arrow
  }

  // Method to navigate back to the patient list
  goBack(): void {
    this.router.navigate(['/patients']); // Navigate to the list page
  }

  // Method to navigate to the prescription detail page
  viewPrescriptionDetails(rxNum: number): void {
    if (this.patientId) {
      this.router.navigate([
        '/patients',
        this.patientId,
        'prescriptions',
        rxNum,
      ]);
    } else {
      console.error(
        'Patient ID is not available to navigate to prescription details.'
      );
      // Optionally show an error message to the user
    }
  }
}
