import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define interfaces for the expected API response structure
// (These should match the structure returned by your backend)

// Interface for basic patient list item
export interface PatientListItem {
  id: number;
  FirstName: string;
  LastName: string;
  Code: string; // Assuming 'Code' is the Patient ID from KrollPatient
  // Add other relevant fields for the list if needed (e.g., Birthday, Prov)
}

export interface PatientDetails {
  id: number;
  FirstName: string;
  LastName: string;
  Salutation: string;
  Gender: string;
  Birthday: string | Date;
  Language: string;
  Height: string;
  Weight: string;
  // Add other fields if needed
}

export interface StatementLine {
  RxNum: number;
  TherapyName: string;
  Balance: string;
  // Add other fields if needed
}

export interface PatientAccountStatement {
  patientDetails: PatientDetails;
  TotalBalance: string;
  statementLines: StatementLine[];
}

// Interface for Financial Statement data
export interface FinancialStatementData {
  StatementDate: string | Date;
  StartDate: string | Date;
  EndDate: string | Date;
  TotalRevenue: string;
  InsurancePayments: string;
  PatientPayments: string;
  OutstandingBalance: string;
}

// Interface for individual transaction in the history
export interface TransactionHistoryItem {
  id: string; // Unique identifier (e.g., 'payment-123' or 'adj-456')
  type: 'PatientPayment' | 'InsuranceAdjudication';
  date: string | Date;
  amount: string;
  paymentMethod: string;
  referenceNumber: string | null;
  refund: boolean;
  paymentPlan: string | null; // Identifier for the insurance plan
}

// Interface for Prescription Detail response
export interface PrescriptionDetailResponse {
  prescriptionDetails: {
    RxNum: number;
    TherapyName: string;
    FillDate: string | Date;
    TotalCharge: string;
    InsurancePaid: string;
    PatientPortionInitial: string;
    InvoiceId: number | null;
  };
  currentBalance: string;
  transactionHistory: TransactionHistoryItem[];
}

// Interface for creating/updating a payment
export interface PaymentRequestBody {
  invoiceId: number;
  amount: number;
  paymentDate: string; // Expecting YYYY-MM-DD or ISO string
  paymentMethod: string;
  referenceNumber?: string | null;
  isRefund: boolean;
  notes?: string | null;
}

// Interface for the Payment object returned by the API
export interface Payment extends PaymentRequestBody {
  id: number;
  PatientId: number;
  TransactionStatus: string; // e.g., 'completed', 'pending', 'failed'
  ExternalTransactionId?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Base URL for your backend API
  // Adjust if your backend runs on a different port or path
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Method to get the patient account statement
  getPatientAccountStatement(
    patientId: number
  ): Observable<PatientAccountStatement> {
    return this.http.get<PatientAccountStatement>(
      `${this.apiUrl}/patients/${patientId}/account-statement`
    );
  }

  // Method to get all patients
  getAllPatients(): Observable<PatientListItem[]> {
    return this.http.get<PatientListItem[]>(`${this.apiUrl}/patients`);
  }

  // Method to get the financial statement
  getFinancialStatement(
    year: number,
    month: number // Month is required again
  ): Observable<FinancialStatementData> {
    let params: { [param: string]: string } = {};
    if (year !== undefined && month !== undefined) {
      // Always construct start date for the month
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      params['startDate'] = startDate; // Backend expects startDate for monthly view
    } else {
      // Handle error or default case if year/month somehow missing
      console.error('getFinancialStatement called without year or month.');
      // Optionally return an error observable or fetch latest by sending no params
      // return throwError(() => new Error('Year and month are required'));
    }

    return this.http.get<FinancialStatementData>(
      `${this.apiUrl}/statements/financial`,
      { params }
    );
  }

  // Method to get prescription details including transaction history
  getPrescriptionDetails(
    patientId: number,
    rxNum: number
  ): Observable<PrescriptionDetailResponse> {
    return this.http.get<PrescriptionDetailResponse>(
      `${this.apiUrl}/patients/${patientId}/prescriptions/${rxNum}/details`
    );
  }

  // Method to create a new payment
  createPayment(paymentData: PaymentRequestBody): Observable<Payment> {
    // The backend route is POST /api/payments
    return this.http.post<Payment>(`${this.apiUrl}/payments`, paymentData);
  }

  // Method to update an existing payment
  updatePayment(
    paymentId: number,
    paymentData: Partial<PaymentRequestBody>
  ): Observable<Payment> {
    return this.http.put<Payment>(
      `${this.apiUrl}/payments/${paymentId}`,
      paymentData
    );
  }

  // Method to delete a payment
  deletePayment(paymentId: number): Observable<void> {
    // Expecting a 204 No Content response, hence Observable<void>
    return this.http.delete<void>(`${this.apiUrl}/payments/${paymentId}`);
  }

  // --- Add other API methods here later ---
  // e.g., createPayment(paymentData: any): Observable<any> {}
  // e.g., updatePayment(paymentId: number, paymentData: any): Observable<any> {}
}
