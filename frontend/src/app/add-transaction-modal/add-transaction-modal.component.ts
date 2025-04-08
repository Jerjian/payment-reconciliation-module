import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { formatISO, parseISO } from 'date-fns';
import { TransactionHistoryItem } from '../services/api.service';

// Interface for the form data emitted
export interface AddTransactionFormData {
  paymentDate: string; // Keep as ISO string for consistency
  amount: number;
  paymentMethod: string;
  referenceNumber?: string; // Keep this for potential future use, though not editable now
  isRefund: boolean;
}

@Component({
  selector: 'app-add-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule], // Import necessary modules
  templateUrl: './add-transaction-modal.component.html',
  styleUrls: ['./add-transaction-modal.component.scss'],
})
export class AddTransactionModalComponent implements OnInit {
  @Input() invoiceId: number | null | undefined; // The invoice ID is fixed
  @Input() existingTransaction: TransactionHistoryItem | null = null; // Input for editing
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<AddTransactionFormData>();

  transactionForm: FormGroup;
  isEditMode = false;

  paymentMethods: string[] = [
    'Credit',
    'Debit',
    'Cash',
    'Check',
    'Direct Deposit',
    'Other',
  ];

  constructor() {
    // Get today's date in YYYY-MM-DD format for default
    const today = formatISO(new Date(), { representation: 'date' });

    this.transactionForm = new FormGroup({
      paymentDate: new FormControl(today, [Validators.required]),
      amount: new FormControl(null, [
        Validators.required,
        Validators.min(0.01),
      ]),
      paymentMethod: new FormControl('', [Validators.required]),
      // referenceNumber: new FormControl(''), // Reference number from form, not linked to invoiceId here
      isRefund: new FormControl(false),
    });
  }

  ngOnInit(): void {
    if (
      this.existingTransaction &&
      this.existingTransaction.type === 'PatientPayment'
    ) {
      this.isEditMode = true;
      // Pre-populate form, handle potential null/undefined values
      this.transactionForm.patchValue({
        paymentDate: this.existingTransaction.date
          ? formatISO(new Date(this.existingTransaction.date), {
              representation: 'date',
            })
          : null,
        amount: this.existingTransaction.amount
          ? parseFloat(this.existingTransaction.amount)
          : null,
        paymentMethod:
          this.existingTransaction.paymentMethod
            ?.toLowerCase()
            .replace(' ', '_') || '',
        isRefund: this.existingTransaction.refund || false,
      });
    } else {
      this.isEditMode = false;
      // Reset form if not editing or if it's not a patient payment
      const today = formatISO(new Date(), { representation: 'date' });
      this.transactionForm.reset({
        paymentDate: today,
        amount: null,
        paymentMethod: '',
        isRefund: false,
      });
    }
  }

  onCancel(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const formData: AddTransactionFormData = {
        // Convert date back to ISO string if needed, or keep as is if backend handles YYYY-MM-DD
        paymentDate: this.transactionForm.value.paymentDate,
        amount: this.transactionForm.value.amount,
        paymentMethod: this.transactionForm.value.paymentMethod,
        // referenceNumber: this.transactionForm.value.referenceNumber, // Pass if needed
        isRefund: this.transactionForm.value.isRefund,
      };
      // Add transaction ID if editing
      if (this.isEditMode && this.existingTransaction?.id) {
        (formData as any).id = this.existingTransaction.id;
      }
      this.submitForm.emit(formData);
    } else {
      // Mark fields as touched to show errors
      this.transactionForm.markAllAsTouched();
      console.error('Form is invalid');
    }
  }
}
