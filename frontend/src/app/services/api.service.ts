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
    year?: number,
    month?: number
  ): Observable<FinancialStatementData> {
    let params = {};
    if (year !== undefined && month !== undefined) {
      // Construct the date string for the first day of the month
      // The backend currently expects start/end dates, let's adjust this later if needed
      // For now, send year and month, assuming backend handles it or defaults
      // A better approach might be to adjust the backend to accept year/month directly
      // or construct specific start/end dates here if backend requires them.
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      // We'll just send the start date for now, assuming backend can derive the period
      // OR adjust backend to specifically use year/month query params
      params = { startDate }; // Simple approach for now
      // params = { year, month }; // If backend is updated
    }

    // If year/month are provided, they will be in params
    // If not, params is empty, and backend should return latest/default
    return this.http.get<FinancialStatementData>(
      `${this.apiUrl}/statements/financial`,
      { params }
    );
  }

  // --- Add other API methods here later ---
  // e.g., getPrescriptionDetails(patientId: number, rxNum: number): Observable<any> {}
  // e.g., createPayment(paymentData: any): Observable<any> {}
  // e.g., updatePayment(paymentId: number, paymentData: any): Observable<any> {}
}
