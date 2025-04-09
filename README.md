# Payment Reconciliation Module

This project provides a web application for reconciling patient payments against pharmacy prescription data, specifically integrating with data structures similar to those found in Kroll pharmacy systems. It features a Node.js/Express/Sequelize backend API and an Angular frontend.

_(Note: This project was initially planned using Python/SQLAlchemy but was transitioned to Node.js/Sequelize)._

## Overview

The application allows users to:

- View patient account statements showing outstanding balances per prescription.
- Drill down into individual prescription details to see a chronological history of insurance adjudications and patient payments/refunds.
- Record new patient payments or refunds against specific prescription invoices.
- View calculated monthly financial summaries for individual patients.
- View calculated overall financial statements for selected periods.

## Technology Stack

- **Backend:**
  - Node.js
  - Express.js
  - Sequelize ORM
  - SQLite (Development/Testing)
  - Jest & Supertest (Testing)
- **Frontend:**
  - Angular Framework
  - TypeScript
  - SCSS

## Core Features

- **Patient & Prescription Data Integration:** Leverages Sequelize models mirroring Kroll database structures (`KrollPatient`, `KrollRxPrescription`, `KrollDrug`, `KrollPlan`, etc.).
- **Payment & Invoice Management:** Introduces `Invoice` and `Payment` tables to track patient financial responsibility and transactions.
- **Reconciliation Views:** Provides detailed views (`patient-account-statement`, `prescription-detail`) showing balances and transaction history.
- **Statement Generation:** Dynamically calculates monthly statements per patient and overall financial statements.
- **CRUD Operations:** Allows creating, updating, and deleting patient payments, automatically updating related invoice statuses.
- **Modular Design:** Separated backend API and frontend client application.

## Reconciliation Flow & Key Concepts

The core of the reconciliation process revolves around the `Invoice` table:

1.  **The Invoice: Central Hub**

    - An `Invoice` record acts as the bridge between a specific Kroll prescription fill (`RxId` -> `KrollRxPrescription.id`) and the payment module.
    - It stores key financial totals derived when the prescription was initially processed (currently by the seeder):
      - `Amount`: Total charge for the prescription fill (calculated from drug cost, markup, fees, etc.).
      - `InsuranceCoveredAmount`: Total paid by _all_ insurance plans combined for that fill (sum of `KrollRxPrescriptionPlanAdj.PlanPays`).
      - `PatientPortion`: Amount the patient is responsible for (`Amount` - `InsuranceCoveredAmount`).
    - It tracks the _current_ payment status against the patient's portion:
      - `AmountPaid`: Sum of direct patient `Payment.Amount` (where `isRefund` is false) _minus_ the sum of `Payment.Amount` (where `isRefund` is true) made against this invoice.
      - `Status`: Automatically updated (`pending`, `partially_paid`, `paid`) based on whether `AmountPaid` >= `PatientPortion`.

2.  **Viewing Reconciliation Details (`prescription-detail` component):**

    - Fetches the `Invoice` for the specific `RxNum`.
    - Fetches all individual insurance adjudication records (`KrollRxPrescriptionPlanAdj`) linked to the `RxNum`.
    - Fetches all individual patient payment/refund records (`Payment`) linked to the `Invoice.id`.
    - Combines insurance adjudications and patient payments into a single, chronologically sorted `transactionHistory`.
    - Displays the `currentBalance` (`Invoice.PatientPortion` - `Invoice.AmountPaid`).

3.  **Viewing Balances (`patient-account-statement` component):**

    - Fetches all prescriptions for the patient.
    - For each prescription, fetches its `Invoice`.
    - Calculates the `Balance` for each line item as `Invoice.PatientPortion` - `Invoice.AmountPaid`.
    - Sums these line balances to show the patient's total outstanding balance.

4.  **Recording Patient Payments/Refunds (`add-transaction-modal` component):**

    - Creates or updates a `Payment` record (with `Amount`, `PaymentDate`, `PaymentMethod`, `isRefund` flag, etc.) linked to the relevant `InvoiceId`.
    - **Crucially:** After saving the `Payment`, the backend _immediately recalculates_ and updates the associated `Invoice`'s `AmountPaid` and `Status` fields. This keeps the invoice's reconciliation status up-to-date.

5.  **Statement Updates (`FinancialStatement` table):**
    - When a `Payment` is created, updated, or deleted, the backend automatically recalculates the relevant monthly totals (revenue, patient payments, outstanding balance) for the month the payment occurred in.
    - It then _updates_ the corresponding record in the `financial_statements` table for that specific month (StartDate/EndDate). This ensures the stored financial statement reflects the impact of payments.

## Setup Instructions

Follow these steps to set up the project on a new machine.

**Prerequisites:**

- **Node.js & npm:** Install from [nodejs.org](https://nodejs.org/). Verify with `node -v` and `npm -v`.
- **Git:** Install from [git-scm.com](https://git-scm.com/) (optional, if cloning).
- **Angular CLI:** Install globally: `npm install -g @angular/cli`

**Backend Setup:**

1.  **Get the Code:** Clone the repository or download the source code.
2.  **Navigate:** Open your terminal and `cd` into the `backend` directory:
    ```bash
    cd path/to/payment-reconciliation-module/backend
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Create `.env` file:** Create a file named `.env` in the `backend` directory with the following content (this configures SQLite):
    ```dotenv
    # backend/.env
    DB_STORAGE=src/pharmacy.db
    ```
5.  **Database Setup (Migrations & Seeding):**
    - **Create Schema:** Run the migrations to create all database tables.
      ```bash
      npx sequelize-cli db:migrate
      ```
    - **Populate Data:** Run the seeder to add initial sample data.
      ```bash
      npx sequelize-cli db:seed:all
      ```
    - **(Optional) Reset Database:** To start fresh (deletes all data!), run:
      ```bash
      npx sequelize-cli db:drop
      npx sequelize-cli db:create
      npx sequelize-cli db:migrate
      npx sequelize-cli db:seed:all
      ```

**Frontend Setup:**

1.  **Navigate:** Open another terminal (or use the same one) and `cd` into the `frontend` directory:
    ```bash
    cd path/to/payment-reconciliation-module/frontend
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```

## Running the Application

1.  **Start Backend:** In the `backend` directory terminal:
    ```bash
    npm start
    ```
    (Or `npm run dev` if nodemon is configured in `package.json`). The API will typically run on `http://localhost:3001`.
2.  **Start Frontend:** In the `frontend` directory terminal:
    ```bash
    ng serve -o
    ```
    This will compile the Angular app, start a development server (usually on `http://localhost:4200`), and automatically open it in your default browser.

## Testing (Backend)

- **Frameworks:** Jest and Supertest are used for backend testing.
- **Current Tests:** Unit tests for controllers (`patientController`, `paymentController`, `statementController`) are located in `backend/tests/`.
- **Running Tests:** In the `backend` directory terminal:
  ```bash
  npm test
  ```

## API Endpoint Overview

- `GET /api/patients`: Get a list of all patients.
- `GET /api/patients/:id`: Get details for a single patient.
- `GET /api/patients/:id/account-statement`: Get patient details, prescription lines with current balances, and total balance.
- `GET /api/patients/:patientId/prescriptions/:rxNum/details`: Get specific prescription details and a combined transaction history (insurance adjudications + patient payments/refunds).
- `POST /api/payments`: Create a new patient payment or refund for an invoice. Updates invoice status. Updates financial statement.
- `PUT /api/payments/:paymentId`: Update an existing payment or refund. Updates invoice status. Updates financial statement(s) for original and new payment months if changed.
- `DELETE /api/payments/:paymentId`: Delete a payment or refund. Updates invoice status. Updates financial statement.
- `GET /api/statements/monthly/patient/:patientId`: Get calculated statement data (opening, charges, payments, closing) for the last 12 months for a patient.
- `GET /api/statements/monthly/patient/:patientId/:year/:month`: Get calculated statement data for a specific month/year for a patient.
- `GET /api/statements/financial?startDate=YYYY-MM-DD`: Get the stored financial statement record matching the period containing the `startDate`. (If no `startDate`, fetches the latest stored statement).

## Current Limitations / Next Steps

- **Automatic Invoice Creation:** The system relies on the seeder to create `Invoice` records. Logic to automatically create/update invoices based on new Kroll prescription/adjudication data is not implemented.
- **Historical Statement Accuracy:** Real-time calculation of monthly statements relies on accurate opening balances, which implicitly depend on past calculations or stored data. Deep historical calculations might be needed for full accuracy if data is missing or incorrect.
- **Testing:** More comprehensive integration and end-to-end tests are recommended. Frontend testing is minimal.
- **Error Handling/Validation:** Can be further enhanced on both backend and frontend.
- **Authentication/Authorization:** Not currently implemented.
- **UI Enhancements:** Add features like pagination, advanced filtering/sorting, export functionality, etc.
