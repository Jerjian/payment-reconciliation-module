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

  // --- Add other API methods here later ---
  // e.g., getPrescriptionDetails(patientId: number, rxNum: number): Observable<any> {}
  // e.g., createPayment(paymentData: any): Observable<any> {}
  // e.g., updatePayment(paymentId: number, paymentData: any): Observable<any> {}
}
