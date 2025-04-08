import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ApiService,
  PrescriptionDetailResponse,
  TransactionHistoryItem,
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
  switchMap,
  catchError,
  tap,
  startWith,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import { format } from 'date-fns';

// Define sortable columns for the transaction table
type SortableColumn =
  | 'date'
  | 'amount'
  | 'paymentMethod'
  | 'paymentPlan'
  | 'refund';

@Component({
  selector: 'app-prescription-detail',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add CommonModule and FormsModule if needed
  templateUrl: './prescription-detail.component.html',
  styleUrl: './prescription-detail.component.scss',
})
export class PrescriptionDetailComponent implements OnInit, OnDestroy {
  // Subjects for raw data, search, and sort
  private prescriptionDataSubject =
    new BehaviorSubject<PrescriptionDetailResponse | null>(null);
  prescriptionData$ = this.prescriptionDataSubject.asObservable();

  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject
    .asObservable()
    .pipe(debounceTime(300), distinctUntilChanged());

  private sortStateSubject = new BehaviorSubject<{
    column: SortableColumn | null;
    direction: 'asc' | 'desc';
  }>({ column: 'date', direction: 'asc' }); // Default sort by date
  sortState$ = this.sortStateSubject.asObservable();

  // Combined ViewModel
  viewModel$: Observable<{
    details: PrescriptionDetailResponse['prescriptionDetails'] | null;
    currentBalance: string;
    filteredTransactions: TransactionHistoryItem[];
    totalResults: number;
    displayedResults: number;
  } | null>;

  patientId: number | null = null;
  rxNum: number | null = null;
  error: string | null = null;
  isLoading: boolean = false;

  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router
  ) {
    // Combine data, search, and sort
    this.viewModel$ = combineLatest([
      this.prescriptionData$,
      this.searchTerm$.pipe(startWith('')),
      this.sortState$,
    ]).pipe(
      map(([data, term, sortState]) => {
        if (!data) {
          return null;
        }

        let transactions = [...data.transactionHistory]; // Copy to avoid modifying original
        const lowerSearchTerm = term.toLowerCase().trim();

        // 1. Filter
        if (lowerSearchTerm) {
          transactions = transactions.filter(
            (tx) =>
              tx.paymentMethod?.toLowerCase().includes(lowerSearchTerm) ||
              tx.referenceNumber?.toLowerCase().includes(lowerSearchTerm) ||
              tx.paymentPlan?.toLowerCase().includes(lowerSearchTerm) ||
              tx.amount?.includes(lowerSearchTerm) ||
              format(new Date(tx.date), 'MM.dd.yyyy').includes(lowerSearchTerm)
          );
        }

        // 2. Sort
        if (sortState.column) {
          transactions.sort((a, b) => {
            let valA: any = null;
            let valB: any = null;

            switch (sortState.column) {
              case 'date':
                valA = new Date(a.date).getTime();
                valB = new Date(b.date).getTime();
                break;
              case 'amount':
                valA = parseFloat(a.amount);
                valB = parseFloat(b.amount);
                // Handle refund sorting: show refunds (negative) after payments (positive)
                if (a.refund !== b.refund) {
                  return a.refund ? 1 : -1; // Refunds come after payments if amounts are same
                }
                break;
              case 'paymentMethod':
                valA = a.paymentMethod?.toLowerCase() || '';
                valB = b.paymentMethod?.toLowerCase() || '';
                break;
              case 'paymentPlan':
                valA = a.paymentPlan?.toLowerCase() || '';
                valB = b.paymentPlan?.toLowerCase() || '';
                break;
              case 'refund':
                valA = a.refund;
                valB = b.refund;
                break;
              // Add cases for other sortable columns if needed
            }

            let comparison = 0;
            if (valA > valB) comparison = 1;
            else if (valA < valB) comparison = -1;

            // Special handling for refund amount sorting (positive vs negative)
            if (sortState.column === 'amount' && a.refund && !b.refund)
              return 1; // Refund after payment
            if (sortState.column === 'amount' && !a.refund && b.refund)
              return -1; // Payment before refund

            return sortState.direction === 'asc' ? comparison : comparison * -1;
          });
        }

        return {
          details: data.prescriptionDetails,
          currentBalance: data.currentBalance,
          filteredTransactions: transactions,
          totalResults: data.transactionHistory.length,
          displayedResults: transactions.length,
        };
      })
    );
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.route.paramMap
        .pipe(
          tap(() => (this.isLoading = true)), // Set loading true on new params
          switchMap((params) => {
            const pId = params.get('patientId');
            const rNum = params.get('rxNum');

            if (pId && rNum) {
              this.patientId = +pId;
              this.rxNum = +rNum;
              return this.apiService
                .getPrescriptionDetails(this.patientId, this.rxNum)
                .pipe(
                  catchError((err) => {
                    console.error('Error loading prescription details:', err);
                    this.error = `Failed to load details: ${
                      err.message || 'Unknown error'
                    }`;
                    this.prescriptionDataSubject.next(null);
                    return of(null); // Return observable of null on error
                  })
                );
            } else {
              this.error = 'Missing patient ID or Rx number in URL.';
              console.error(this.error);
              this.prescriptionDataSubject.next(null);
              return of(null); // Return observable of null if params missing
            }
          }),
          tap((data) => {
            this.prescriptionDataSubject.next(data);
            this.error = data ? null : this.error; // Clear error only if data loaded
            this.isLoading = false;
          })
        )
        .subscribe()
    );

    // Reset sort state
    this.sortStateSubject.next({ column: 'date', direction: 'asc' });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Update search term
  onSearchTermChange(term: string): void {
    this.searchTermSubject.next(term);
  }

  // Apply sorting
  applySort(column: SortableColumn): void {
    const currentSortState = this.sortStateSubject.value;
    let nextDirection: 'asc' | 'desc' = 'asc';

    if (currentSortState.column === column) {
      nextDirection = currentSortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      nextDirection = 'asc';
    }
    this.sortStateSubject.next({ column: column, direction: nextDirection });
  }

  // Get sort icon
  getSortIcon(
    column: SortableColumn,
    state: { column: SortableColumn | null; direction: 'asc' | 'desc' }
  ): string {
    if (state.column !== column) return '\u21F5'; // Default up/down
    return state.direction === 'asc' ? '\u2191' : '\u2193'; // Up or Down arrow
  }

  // Navigate back to the patient account statement
  goBack(): void {
    if (this.patientId) {
      this.router.navigate(['/patients', this.patientId, 'account-statement']);
    } else {
      this.router.navigate(['/patients']); // Fallback to patient list
    }
  }

  // Placeholder for Add Transaction action
  addTransaction(): void {
    // TODO: Implement logic to open a modal or navigate to a form
    console.log('Add Transaction clicked');
    alert('Add transaction functionality not yet implemented.');
  }

  // Placeholder for Edit Transaction
  editTransaction(transaction: TransactionHistoryItem): void {
    console.log('Edit transaction:', transaction);
    alert('Edit transaction functionality not yet implemented.');
  }

  // Placeholder for Delete Transaction
  deleteTransaction(transaction: TransactionHistoryItem): void {
    console.log('Delete transaction:', transaction);
    // Confirmation dialog is recommended here
    alert('Delete transaction functionality not yet implemented.');
  }

  // Helper for formatting date in the template if needed directly (alternative to pipe)
  formatDate(date: string | Date): string {
    return format(new Date(date), 'MM.dd.yyyy');
  }
}
