import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  ApiService,
  PrescriptionDetailResponse,
  TransactionHistoryItem,
  PatientDetails,
  PaymentRequestBody,
  Payment,
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
import {
  AddTransactionModalComponent,
  AddTransactionFormData,
} from '../add-transaction-modal/add-transaction-modal.component';

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
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AddTransactionModalComponent,
  ],
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
  currentInvoiceId: number | null = null;
  error: string | null = null;
  isLoading: boolean = false;
  isModalOpen = false;
  transactionToEdit: TransactionHistoryItem | null = null;

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
            this.currentInvoiceId =
              data?.prescriptionDetails?.InvoiceId ?? null;
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
    // Only allow editing patient payments for now
    if (transaction.type === 'PatientPayment') {
      console.log('Editing transaction:', transaction);
      this.transactionToEdit = transaction; // Set the transaction to edit
      this.isModalOpen = true; // Open the modal
    } else {
      alert('Editing insurance adjustments is not supported yet.');
    }
  }

  // Handle Delete Transaction
  deleteTransaction(transaction: TransactionHistoryItem): void {
    // Only allow deleting patient payments for now
    if (transaction.type !== 'PatientPayment') {
      alert('Deleting insurance adjustments is not supported yet.');
      return;
    }

    const paymentIdString = transaction.id.split('-')[1];
    if (!paymentIdString) {
      console.error(
        'Could not extract payment ID from transaction:',
        transaction
      );
      this.error = 'Error: Could not identify the payment to delete.';
      return;
    }
    const paymentId = parseInt(paymentIdString, 10);
    if (isNaN(paymentId)) {
      console.error('Invalid payment ID parsed:', paymentIdString);
      this.error = 'Error: Invalid payment identifier.';
      return;
    }

    // Confirmation dialog
    const confirmation = confirm(
      `Are you sure you want to delete this payment of ${transaction.amount}?`
    );
    if (!confirmation) {
      return; // User cancelled
    }

    console.log(`Attempting to delete payment ID: ${paymentId}`);
    this.isLoading = true;
    this.error = null; // Clear previous errors

    this.subscriptions.add(
      this.apiService.deletePayment(paymentId).subscribe({
        next: () => {
          console.log(`Payment ID ${paymentId} deleted successfully.`);
          this.refreshPrescriptionDetails(); // Reload data on success
          // Optionally show a success message to the user
        },
        error: (err) => {
          console.error(`Error deleting payment ID ${paymentId}:`, err);
          this.error = `Failed to delete transaction: ${
            err.message || 'Unknown API error'
          }`;
          this.isLoading = false; // Ensure loading indicator stops on error
        },
        // 'complete' is called after 'next' or 'error', isLoading is set in next/error
      })
    );
  }

  // Helper for formatting date in the template if needed directly (alternative to pipe)
  formatDate(date: string | Date): string {
    return format(new Date(date), 'MM.dd.yyyy');
  }

  // --- Modal Methods ---
  openAddTransactionModal(): void {
    if (this.currentInvoiceId) {
      this.isModalOpen = true;
    } else {
      this.error = 'Cannot add transaction: Invoice ID is missing.';
      console.error('Cannot open modal, currentInvoiceId is null');
      // Optionally show a user-friendly message
    }
  }

  handleCloseModal(): void {
    this.isModalOpen = false;
    this.transactionToEdit = null; // Clear transaction on close
  }

  handleFormSubmit(formData: AddTransactionFormData & { id?: string }): void {
    console.log('Form Submitted:', formData);

    const isEditing = !!formData.id; // Check if it's an edit
    const paymentIdToUpdate = isEditing
      ? parseInt(formData.id!.split('-')[1], 10)
      : null;

    // Construct the main request body (excluding invoiceId for update)
    const requestBody: Partial<PaymentRequestBody> = {
      amount: formData.amount,
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      isRefund: formData.isRefund,
      // referenceNumber: formData.referenceNumber, // Only if collected/editable
    };

    this.isLoading = true;
    this.isModalOpen = false;

    let apiCall: Observable<Payment>;

    if (isEditing && paymentIdToUpdate) {
      console.log(`Updating payment ID: ${paymentIdToUpdate}`);
      apiCall = this.apiService.updatePayment(paymentIdToUpdate, requestBody);
    } else if (!isEditing && this.currentInvoiceId) {
      console.log(
        `Creating new payment for invoice ID: ${this.currentInvoiceId}`
      );
      // Add invoiceId only when creating
      const createBody: PaymentRequestBody = {
        ...requestBody,
        invoiceId: this.currentInvoiceId,
      } as PaymentRequestBody;
      apiCall = this.apiService.createPayment(createBody);
    } else {
      console.error(
        'Invalid state for submission: Missing invoiceId for create or paymentId for update.'
      );
      this.error = 'Cannot submit transaction: Invalid state.';
      this.isLoading = false;
      this.transactionToEdit = null;
      return;
    }

    this.subscriptions.add(
      apiCall.subscribe({
        next: (savedPayment) => {
          console.log(
            `Payment ${isEditing ? 'updated' : 'created'}:`,
            savedPayment
          );
          this.refreshPrescriptionDetails(); // Reload data
          this.transactionToEdit = null; // Clear editing state
        },
        error: (err) => {
          console.error(
            `Error ${isEditing ? 'updating' : 'creating'} payment:`,
            err
          );
          this.error = `Failed to ${
            isEditing ? 'update' : 'add'
          } transaction: ${err.message || 'Unknown error'}`;
          this.isLoading = false;
          this.transactionToEdit = null; // Clear editing state on error too
        },
      })
    );
  }

  // Helper to reload data after modification
  refreshPrescriptionDetails(): void {
    if (this.patientId && this.rxNum) {
      this.isLoading = true;
      this.subscriptions.add(
        this.apiService
          .getPrescriptionDetails(this.patientId, this.rxNum)
          .subscribe({
            next: (data) => {
              this.prescriptionDataSubject.next(data);
              this.currentInvoiceId =
                data?.prescriptionDetails?.InvoiceId ?? null;
              this.error = null;
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error reloading prescription details:', err);
              this.error = `Failed to reload details: ${
                err.message || 'Unknown error'
              }`;
              this.prescriptionDataSubject.next(null);
              this.isLoading = false;
            },
          })
      );
    } else {
      console.error('Cannot refresh details: PatientId or RxNum missing');
    }
  }
}
