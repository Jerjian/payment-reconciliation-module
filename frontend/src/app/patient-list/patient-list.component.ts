import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService, PatientListItem } from '../services/api.service';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import {
  map,
  startWith,
  debounceTime,
  distinctUntilChanged,
  catchError,
} from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

// Define the type for sortable columns
type SortablePatientColumn = 'Code' | 'FirstName' | 'LastName'; // Add other fields if needed

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss',
})
export class PatientListComponent implements OnInit {
  // Hold raw patient list
  private rawPatientsSubject = new BehaviorSubject<PatientListItem[]>([]);
  rawPatients$ = this.rawPatientsSubject.asObservable();

  // Search term
  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject
    .asObservable()
    .pipe(debounceTime(300), distinctUntilChanged());

  // Sort state
  private sortStateSubject = new BehaviorSubject<{
    column: SortablePatientColumn | null;
    direction: 'asc' | 'desc';
  }>({ column: 'LastName', direction: 'asc' }); // Default sort by LastName
  sortState$ = this.sortStateSubject.asObservable();

  // Combined view model
  viewModel$: Observable<{
    filteredPatients: PatientListItem[];
    displayedResults: number;
  } | null>;

  isLoading: boolean = false;
  error: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {
    // Combine raw data, search term, and sort state
    this.viewModel$ = combineLatest([
      this.rawPatients$,
      this.searchTerm$.pipe(startWith('')),
      this.sortState$,
    ]).pipe(
      map(([patients, term, sortState]) => {
        if (!patients) {
          return null;
        }

        // Filter
        const lowerSearchTerm = term.toLowerCase().trim();
        let filteredPatients = patients;
        if (lowerSearchTerm) {
          filteredPatients = patients.filter(
            (p) =>
              p.Code.toLowerCase().includes(lowerSearchTerm) ||
              p.FirstName.toLowerCase().includes(lowerSearchTerm) ||
              p.LastName.toLowerCase().includes(lowerSearchTerm)
          );
        }

        // Sort
        if (sortState.column) {
          filteredPatients = [...filteredPatients].sort((a, b) => {
            const valA = a[sortState.column!].toLowerCase();
            const valB = b[sortState.column!].toLowerCase();
            let comparison = 0;
            if (valA > valB) comparison = 1;
            else if (valA < valB) comparison = -1;
            return sortState.direction === 'asc' ? comparison : comparison * -1;
          });
        }

        return {
          filteredPatients: filteredPatients,
          displayedResults: filteredPatients.length,
        };
      })
    );
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.error = null;
    this.rawPatientsSubject.next([]); // Clear previous

    this.apiService
      .getAllPatients()
      .pipe(
        catchError((err) => {
          console.error('Error loading patients:', err);
          this.error = `Failed to load patients: ${
            err.message || 'Unknown error'
          }`;
          this.isLoading = false;
          return of([]); // Return empty array on error
        })
      )
      .subscribe((patients) => {
        this.rawPatientsSubject.next(patients);
        this.isLoading = false;
      });
  }

  onSearchTermChange(term: string): void {
    this.searchTermSubject.next(term);
  }

  applySort(column: SortablePatientColumn): void {
    const currentSortState = this.sortStateSubject.value;
    let nextDirection: 'asc' | 'desc' = 'asc';
    if (currentSortState.column === column) {
      nextDirection = currentSortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      nextDirection = 'asc';
    }
    this.sortStateSubject.next({ column: column, direction: nextDirection });
  }

  getSortIcon(
    column: SortablePatientColumn,
    state: { column: SortablePatientColumn | null; direction: 'asc' | 'desc' }
  ): string {
    if (state.column !== column) {
      return '\u21F5'; // Default
    }
    return state.direction === 'asc' ? '\u2191' : '\u2193'; // Up or Down
  }

  // Navigate to patient details
  viewPatientStatement(patientId: number): void {
    this.router.navigate(['/patients', patientId, 'account-statement']);
  }
}
