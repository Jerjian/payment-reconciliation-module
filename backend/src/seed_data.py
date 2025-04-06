# seed_data.py
import os
# Ensure the script can find the models and database modules
import sys
# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.db import (
    KrollPatient, KrollDrug, KrollPlan, KrollPlanSub, KrollPatientPlan,
    KrollRxPrescription, Invoice, Payment, KrollRxPrescriptionPlan,
    KrollRxPrescriptionPlanAdj, MonthlyStatement, FinancialStatement,
    KrollPatientPhone, KrollPatientAlg, KrollPatientCnd, KrollPatientCom,
    KrollDrugPack, KrollDrugPackInvHist 
)
from database import SessionLocal, init_db, DB_PATH
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
from decimal import Decimal
import random

# Helper function to get or create an entity
def get_or_create(session, model, defaults=None, **kwargs):
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        return instance, False
    else:
        params = dict((k, v) for k, v in kwargs.items())
        if defaults:
            params.update(defaults)
        instance = model(**params)
        session.add(instance)
        session.flush() # Flush to get ID before commit if needed elsewhere
        return instance, True

def seed_database():
    """Seed the database with new test data according to requirements."""
    print("Starting database seeding...")
    db = SessionLocal()
    try:
        # --- Clear Existing Data (Optional but recommended for a clean restart) ---
        # Be very careful with this in production!
        print("Clearing existing data (optional step)...")
        # Order matters due to foreign key constraints
        db.query(Payment).delete()
        db.query(Invoice).delete()
        db.query(KrollRxPrescriptionPlanAdj).delete()
        db.query(KrollRxPrescriptionPlan).delete()
        db.query(KrollRxPrescription).delete()
        db.query(KrollPatientPlan).delete()
        db.query(KrollPlanSub).delete()
        db.query(KrollPlan).delete()
        db.query(KrollDrugPackInvHist).delete()
        db.query(KrollDrugPack).delete()
        db.query(KrollDrug).delete()
        db.query(KrollPatientPhone).delete()
        db.query(KrollPatientAlg).delete()
        db.query(KrollPatientCnd).delete()
        db.query(KrollPatientCom).delete()
        db.query(MonthlyStatement).delete()
        db.query(FinancialStatement).delete()
        db.query(KrollPatient).delete()
        db.commit()
        print("Existing data cleared.")

        # --- 1. Create Patients (3 patients in 3 provinces) ---
        print("Creating patients...")
        patients_data = [
            {"LastName": "Trudeau", "FirstName": "Justin", "Prov": "ON", "City": "Ottawa", "Sex": "M", "Language": "E", "Birthday": datetime(1971, 12, 25)},
            {"LastName": "Horgan", "FirstName": "John", "Prov": "BC", "City": "Victoria", "Sex": "M", "Language": "E", "Birthday": datetime(1959, 8, 13)},
            {"LastName": "Legault", "FirstName": "Francois", "Prov": "QC", "City": "Montreal", "Sex": "M", "Language": "F", "Birthday": datetime(1957, 5, 26)},
        ]
        created_patients = []
        for i, data in enumerate(patients_data):
            patient, _ = get_or_create(db, KrollPatient,
                defaults={
                    "Address1": f"{i+1} Main St",
                    "Postal": "A1A 1A1",
                    "Country": "Canada",
                    "CreatedOn": datetime.now(),
                    "LastChanged": datetime.now(),
                    "Active": True,
                    "Code": f"PAT{1000+i}" # Example unique code
                },
                **data
            )
            created_patients.append(patient)
            # Add a phone number for each patient
            phone, _ = get_or_create(db, KrollPatientPhone,
                 PatID=patient.id,
                 Description="Home",
                 defaults={"Phone": f"555-010{i}", "LongDistance": False, "Type": 0}
            )

        db.commit()
        print(f"Created {len(created_patients)} patients.")

        # --- 2. Create Drugs (2 drugs) ---
        print("Creating drugs...")
        drugs_data = [
            {"BrandName": "Ozempic", "GenericName": "Semaglutide", "DIN": "02471464", "Active": True, "Schedule": "Rx", "Form": "Injection", "Strength": "1mg/dose", "Manufacturer": "Novo Nordisk"},
            {"BrandName": "Tylenol", "GenericName": "Acetaminophen", "DIN": "00559407", "Active": True, "Schedule": "OTC", "Form": "Tablet", "Strength": "500mg", "Manufacturer": "Johnson & Johnson"}
        ]
        created_drugs = []
        for data in drugs_data:
            drug, _ = get_or_create(db, KrollDrug,
                defaults={"Comment": "Standard drug", "createdAt": datetime.now(), "updatedAt": datetime.now()},
                **data
            )
            created_drugs.append(drug)
            # Add a default pack size for inventory/dispensing reference
            pack, _ = get_or_create(db, KrollDrugPack,
                DrgID=drug.id,
                PackSize=Decimal('100.0') if drug.GenericName == "Acetaminophen" else Decimal('1.0'), # 100 tabs vs 1 pen
                defaults={
                    "QuickCode": f"{drug.DIN[:5]}PK",
                    "Active": True,
                    "PackUnit": "Tablet" if drug.GenericName == "Acetaminophen" else "Pen",
                    "OnHandQty": Decimal('500.0') if drug.GenericName == "Acetaminophen" else Decimal('10.0'),
                    "AcqCost": Decimal('5.50') if drug.GenericName == "Acetaminophen" else Decimal('150.75'),
                    "SellingCost": Decimal('10.00') if drug.GenericName == "Acetaminophen" else Decimal('250.00'),
                    "createdAt": datetime.now(),
                    "updatedAt": datetime.now(),
                }
            )

        db.commit()
        print(f"Created {len(created_drugs)} drugs with default packs.")

        # --- 3. Create Plans (1 ON, 1 BC) ---
        print("Creating plans...")
        plans_data = [
            {"PlanCode": "OHIP", "Description": "Ontario Health Insurance Plan", "Prov": "ON", "IsProvincialPlan": True, "PharmacyID": "ONPHA001", "BIN": "610502"},
            {"PlanCode": "BCMSP", "Description": "BC Medical Services Plan", "Prov": "BC", "IsProvincialPlan": True, "PharmacyID": "BCPHA001", "BIN": "610402"},
            # We can add a private plan too if needed later
            # {"PlanCode": "SUNLIFE", "Description": "Sun Life Assurance", "Prov": "NA", "IsProvincialPlan": False, "PharmacyID": "PRV001", "BIN": "610047"}
        ]
        created_plans = []
        for data in plans_data:
            plan, _ = get_or_create(db, KrollPlan,
                defaults={"AlternatePayee": False, "CheckCoverage": True, "IsRealTime": True},
                **data
            )
            created_plans.append(plan)
        db.commit() # Commit plans to get their IDs
        print(f"Created {len(created_plans)} plans.")

        # --- 4. Create SubPlans (STANDARD and PREMIUM for each Plan) ---
        print("Creating subplans...")
        created_subplans = {} # Dictionary to hold subplans by PlanID
        subplan_codes = ["STANDARD", "PREMIUM"]
        for plan in created_plans:
            created_subplans[plan.id] = []
            for i, code in enumerate(subplan_codes):
                subplan, _ = get_or_create(db, KrollPlanSub,
                    PlanID=plan.id,
                    SubPlanCode=code,
                    defaults={
                        "Description": f"{code} Coverage ({plan.Prov})",
                        "DefSubPlan": (code == "STANDARD"), # Make STANDARD the default
                        "CarrierIDRO": False, "GroupRO": False, "ClientRO": False, "CPHARO": False, "RelRO": False, "ExpiryRO": False,
                        "CarrierIDReq": (plan.Prov != 'ON'), # Example: BC might require CarrierID, ON might not
                        "GroupReq": True,
                        "ClientReq": True,
                        "CPHAReq": False,
                        "RelReq": True,
                        "ExpiryReq": False,
                        "DeductReq": False,
                        "BirthReq": True, # Often required
                        "Active": True,
                        "AllowManualBilling": True
                    }
                )
                created_subplans[plan.id].append(subplan)
        db.commit()
        print(f"Created {sum(len(v) for v in created_subplans.values())} subplans.")

        # --- 5. Link Patients to Plans/SubPlans ---
        print("Linking patients to plans...")
        created_patient_plans = []
        for i, patient in enumerate(created_patients):
            # Find the plan for the patient's province
            matching_plan = next((p for p in created_plans if p.Prov == patient.Prov), None)
            if matching_plan:
                # Assign a subplan (e.g., alternate between STANDARD and PREMIUM)
                subplan_to_assign = created_subplans[matching_plan.id][i % len(subplan_codes)]

                patient_plan, _ = get_or_create(db, KrollPatientPlan,
                    PatID=patient.id,
                    PlanID=matching_plan.id,
                    SubPlanID=subplan_to_assign.id,
                    defaults={
                        "Sequence": 1, # Primary plan
                        "Cardholder": f"{patient.FirstName} {patient.LastName}",
                        "CarrierID": "CARR01" if matching_plan.Prov == 'BC' else None, # Example Carrier ID if required
                        "GroupID": f"GRP{patient.Prov}001",
                        "ClientID": f"{patient.LastName.upper()}{patient.FirstName[0]}{str(patient.Birthday.year)[-2:]}", # Example Client ID logic
                        "Rel": "01", # 01=Cardholder, 02=Spouse, 03=Dependent
                        "Birthday": patient.Birthday,
                        "PatSex": patient.Sex,
                        "FirstName": patient.FirstName,
                        "LastName": patient.LastName,
                        "AlwaysUseInRx": True,
                        "Deleted": False
                    }
                )
                created_patient_plans.append(patient_plan)
            else:
                print(f"Warning: No plan found for patient {patient.FirstName} {patient.LastName} in province {patient.Prov}. Skipping plan linking.")
        db.commit()
        print(f"Linked {len(created_patient_plans)} patients to plans.")

        # --- 6. Create Prescriptions ---
        print("Creating prescriptions...")
        created_prescriptions = []
        total_revenue = Decimal('0.0')
        total_insurance_payments = Decimal('0.0')
        total_patient_payments = Decimal('0.0')
        total_outstanding_patient_portion = Decimal('0.0')

        # Generate unique RxNums starting from a base
        base_rx_num = 10000
        current_rx_num = base_rx_num

        fill_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=35) # Start fills ~5 weeks ago

        for i, patient in enumerate(created_patients):
            for j in range(random.randint(1, 2)): # Give each patient 1 or 2 prescriptions
                drug = created_drugs[(i + j) % len(created_drugs)] # Alternate drugs
                is_ozempic = (drug.BrandName == "Ozempic")
                disp_qty = Decimal('1.0') if is_ozempic else Decimal('90.0')
                days_supply = 28 if is_ozempic else 90
                cost_per_unit = Decimal('250.00') if is_ozempic else Decimal('0.10') # Base cost per Pen/Tablet

                # --- Pricing Simulation ---
                # Get AcqCost from KrollDrugPack for more realistic base cost
                drug_pack = db.query(KrollDrugPack).filter(KrollDrugPack.DrgID == drug.id).first()
                base_cost = drug_pack.AcqCost if drug_pack and drug_pack.AcqCost else cost_per_unit
                aac = base_cost * disp_qty # Allowable Acquisition Cost
                markup_percentage = Decimal('0.10') # 10% markup
                markup = round(aac * markup_percentage, 2)
                fee = Decimal('12.00') # Standard dispensing fee
                total_charge = round(aac + markup + fee, 2)

                rx_num_unique = current_rx_num + i * 10 + j # Ensure unique RxNum
                rx = KrollRxPrescription(
                    PatID=patient.id,
                    DrgID=drug.id,
                    MixID=None, # Assuming not a compound
                    OrigRxNum=rx_num_unique,
                    RxNum=rx_num_unique,
                    Init="SYS", # System generated
                    UserInit="SEED",
                    FillDate=fill_date,
                    WrittenDate=fill_date - timedelta(days=random.randint(1, 5)),
                    FirstFillDate=fill_date, # Assuming first fill
                    LastFillDate=fill_date,
                    DispQty=disp_qty,
                    DaysSupply=days_supply,
                    AuthQty=disp_qty * 3, # 3 refills authorized
                    RemQty=disp_qty * 2, # Remaining refills quantity
                    Labels=1,
                    ProductSelection=1, # Brand specified
                    SIG=f"Take {'1 injection weekly' if is_ozempic else '1 tablet daily'}",
                    DIN=drug.DIN,
                    PackSize=drug_pack.PackSize if drug_pack else (Decimal('1.0') if is_ozempic else Decimal('100.0')),
                    AAC=aac,
                    Cost=aac, # Cost often reflects AAC before markup/fee
                    Markup=markup,
                    Fee=fee,
                    MixTime=None, MixFee=Decimal('0.00'), SSCFee=Decimal('0.00'),
                    PriceDiscount=Decimal('0.00'), DeductDiscount=Decimal('0.00'),
                    ManualPrice=False,
                    Status=1, # Active/Filled
                    AdjState=0, # Not yet adjudicated (will update)
                    Inactive=False,
                    createdAt=datetime.now(),
                    Charged=True # Assume charged at fill time
                )
                db.add(rx)
                created_prescriptions.append(rx)
                db.flush() # Ensure rx.id and rx.RxNum are available

                # --- 7. Simulate Adjudication (RxPlan and RxPlanAdj) ---
                patient_plan_link = db.query(KrollPatientPlan).filter(KrollPatientPlan.PatID == patient.id).first()
                insurance_pays = Decimal('0.00')
                adj_state = 4 # Default to Rejected/Error

                if patient_plan_link:
                    # Simple simulation: Provincial plans cover Ozempic partially, Tylenol not at all
                    plan_pays_amount = Decimal('0.00')
                    if patient_plan_link.plan.IsProvincialPlan:
                        if is_ozempic:
                            plan_pays_amount = round(total_charge * Decimal('0.75'), 2) # Covers 75%
                            adj_state = 1 # Paid
                            result_code = 'PAY'
                        else: # Tylenol (OTC)
                             plan_pays_amount = Decimal('0.00')
                             adj_state = 3 # Not covered
                             result_code = 'REJ' # Rejected - Benefit Not Covered
                    else: # Assume private plan might cover more (if we added one)
                         plan_pays_amount = round(total_charge * Decimal('0.80'), 2)
                         adj_state = 1 # Paid
                         result_code = 'PAY'

                    insurance_pays = plan_pays_amount

                    rx_plan = KrollRxPrescriptionPlan(
                        Seq=1,
                        RxNum=rx.RxNum, # Use the actual unique RxNum
                        PatPlnID=patient_plan_link.id,
                        Pays=plan_pays_amount,
                        TranType=1, # Claim
                        AdjState=adj_state,
                        SubPlanCode=patient_plan_link.subplan.SubPlanCode,
                        IsRT=True, # Realtime attempt
                        AdjDate=fill_date + timedelta(minutes=1)
                    )
                    db.add(rx_plan)
                    db.flush() # Get rx_plan.id

                    rx_plan_adj = KrollRxPrescriptionPlanAdj(
                        TS=fill_date + timedelta(minutes=1),
                        RxPlnID=rx_plan.id,
                        ResultCode=result_code,
                        AdjDate=fill_date + timedelta(minutes=1),
                        Cost=rx.Cost, Markup=rx.Markup, Fee=rx.Fee, MixFee=rx.MixFee, SSCFee=rx.SSCFee,
                        PlanPays=plan_pays_amount,
                        SubCost=rx.Cost, SubMarkup=rx.Markup, SubFee=rx.Fee, SubMixFee=rx.MixFee, SubSSCFee=rx.SSCFee, # Submitted amounts
                        PrevPaid=Decimal('0.00'),
                        AdjudicationLevel=1,
                        RxNum=rx.RxNum, # Use the actual unique RxNum
                        Copay=total_charge - plan_pays_amount, # Calculated Copay
                        Deductible=Decimal('0.00'), # Assume no deductible for simplicity
                        CoInsurance=Decimal('0.00') # Assume co-insurance is handled in PlanPays calc
                    )
                    db.add(rx_plan_adj)

                    # Update Rx AdjState based on adjudication
                    rx.AdjState = adj_state
                    db.add(rx) # Add again to stage the update

                # --- 8. Create Invoices ---
                patient_portion = total_charge - insurance_pays
                invoice = Invoice(
                    patientId=patient.id,
                    rxId=rx.id,
                    invoiceDate=fill_date,
                    dueDate=fill_date + timedelta(days=30),
                    description=f"Rx #{rx.RxNum} {drug.BrandName}",
                    amount=total_charge,
                    amountPaid=Decimal('0.00'), # Initialize as unpaid
                    insuranceCoveredAmount=insurance_pays,
                    patientPortion=patient_portion,
                    status='pending'
                )
                db.add(invoice)
                db.flush() # Get invoice.id

                # --- 9. Create Payments (for some invoices) ---
                payment_made = False
                payment_amount = Decimal('0.00')
                if patient_portion > 0 and random.random() < 0.7: # 70% chance of payment if there's a patient portion
                    payment_amount = patient_portion # Pay in full for simplicity
                    payment = Payment(
                        patientId=patient.id,
                        invoiceId=invoice.id, # Direct link to invoice
                        amount=payment_amount,
                        paymentDate=fill_date + timedelta(days=random.randint(1, 14)),
                        paymentMethod=random.choice(["credit", "debit", "cash"]),
                        referenceNumber=f"PAY{invoice.id}{random.randint(100,999)}",
                        transactionStatus='completed',
                        notes="Seed payment"
                    )
                    db.add(payment)
                    payment_made = True

                    # --- 10. Update Invoice Status ---
                    invoice.amountPaid = payment_amount
                    invoice.status = 'paid'
                    db.add(invoice) # Add again to stage the update

                # Update financial statement aggregates
                total_revenue += total_charge
                total_insurance_payments += insurance_pays
                if payment_made:
                    total_patient_payments += payment_amount
                else:
                    total_outstanding_patient_portion += patient_portion

                # Increment fill date for next Rx
                fill_date += timedelta(days=random.randint(3, 10))

        db.commit() # Commit all prescriptions, plans, adjs, invoices, payments
        print(f"Created {len(created_prescriptions)} prescriptions with simulated adjudication, invoices, and payments.")


        # --- 11. Generate Monthly Statements ---
        print("Generating monthly statements...")
        statement_date = datetime.now().replace(day=1) - timedelta(days=1) # End of last month
        start_date = statement_date.replace(day=1) # Start of last month
        end_date = statement_date

        for patient in created_patients:
            # Query invoices and payments for this patient within the statement period
            # Note: For simplicity, we sum *all* seeded invoices/payments for this demo.
            # A real system would filter by date range (invoiceDate/paymentDate).
            patient_invoices = db.query(Invoice).filter(Invoice.patientId == patient.id).all()
            patient_payments = db.query(Payment).filter(Payment.patientId == patient.id).all()

            # Calculate statement values (simplified for seed)
            opening_balance = Decimal('0.00') # Assume zero opening for seed data
            charges = sum(inv.patientPortion for inv in patient_invoices) # Total patient portion charged
            payments_received = sum(pay.amount for pay in patient_payments) # Total payments received
            closing_balance = opening_balance + charges - payments_received

            statement = MonthlyStatement(
                patientId=patient.id,
                statementDate=statement_date,
                startDate=start_date,
                endDate=end_date,
                openingBalance=opening_balance,
                totalCharges=charges,
                totalPayments=payments_received,
                closingBalance=closing_balance
            )
            db.add(statement)
        db.commit()
        print("Generated monthly statements.")

        # --- 12. Generate Financial Statement ---
        print("Generating financial statement...")
        # Using the aggregates calculated during Rx creation loop
        financial_statement = FinancialStatement(
            statementDate=statement_date,
            startDate=start_date,
            endDate=end_date,
            totalRevenue=total_revenue, # Sum of Invoice.amount
            insurancePayments=total_insurance_payments, # Sum of Invoice.insuranceCoveredAmount
            patientPayments=total_patient_payments, # Sum of actual Payments.amount received
            outstandingBalance=total_outstanding_patient_portion # Sum of Invoice.patientPortion where status != paid
        )
        db.add(financial_statement)
        db.commit()
        print("Generated financial statement.")

        print("Database seeding completed successfully!")

    except IntegrityError as e:
        db.rollback()
        print(f"Error seeding database: {e}. Rolled back changes.")
        # It might be helpful to print specific details causing the IntegrityError
        if hasattr(e, 'params') and hasattr(e, 'statement'):
            print(f"Statement: {e.statement}")
            print(f"Parameters: {e.params}")
    except Exception as e:
        db.rollback()
        print(f"An unexpected error occurred: {e}. Rolled back changes.")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
        print("Database session closed.")

if __name__ == "__main__":
    print(f"Database file path: {DB_PATH}")
    # Check if DB file exists, prompt if user wants to re-initialize
    # This is safer than just blindly deleting.
    if os.path.exists(DB_PATH):
         # Initialize (creates tables if they don't exist)
        print("Database file exists. Ensuring tables are created...")
        init_db()
        confirm = input("Database already exists. Do you want to clear it and re-seed? (yes/no): ")
        if confirm.lower() == 'yes':
            seed_database()
        else:
            print("Seeding cancelled.")
    else:
         print("Database file does not exist. Initializing and seeding...")
         init_db() # Initialize database first
         seed_database()



# from models.db import (
#     KrollPatient, KrollDrug, KrollPlan, KrollPlanSub, KrollPatientPlan,
#     KrollRxPrescription, Invoice, Payment, PaymentInvoice
# )
# from database import SessionLocal, init_db
# from datetime import datetime, timedelta
# from sqlalchemy.exc import IntegrityError
# import random

# def seed_database():
#     """Seed the database with minimal test data"""
#     db = SessionLocal()
    
#     try:
#         # Create patients
#         patients = [
#             KrollPatient(
#                 LastName="Smith", 
#                 FirstName="John",
#                 Prov="ON",
#                 Country="Canada",
#                 Sex="M",
#                 Language="E",
#                 CreatedOn=datetime.now(),
#                 LastChanged=datetime.now(),
#                 Active=True
#             ),
#             KrollPatient(
#                 LastName="Doe", 
#                 FirstName="Jane",
#                 Prov="QC",
#                 Country="Canada",
#                 Sex="F",
#                 Language="F",
#                 CreatedOn=datetime.now(),
#                 LastChanged=datetime.now(),
#                 Active=True
#             ),
#             KrollPatient(
#                 LastName="Brown", 
#                 FirstName="Michael",
#                 Prov="BC",
#                 Country="Canada",
#                 Sex="M",
#                 Language="E",
#                 CreatedOn=datetime.now(),
#                 LastChanged=datetime.now(),
#                 Active=True
#             )
#         ]
        
#         for patient in patients:
#             db.add(patient)
#         db.commit()
        
#         # Create drugs
#         drugs = [
#             KrollDrug(
#                 BrandName="Lipitor",
#                 GenericName="Atorvastatin",
#                 DIN="00123456789",
#                 Active=True,
#                 Schedule="Rx"
#             ),
#             KrollDrug(
#                 BrandName="Advil",
#                 GenericName="Ibuprofen",
#                 DIN="00987654321",
#                 Active=True,
#                 Schedule="OTC"
#             )
#         ]
        
#         for drug in drugs:
#             db.add(drug)
#         db.commit()
        
#         # Create plans - fix required fields
#         plan = KrollPlan(
#             PlanCode="OHIP",
#             Description="Ontario Health Insurance Plan",
#             Prov="ON",
#             IsProvincialPlan=True,
#             # Add required non-nullable fields
#             AlternatePayee=False,  # From error message
#             CheckCoverage=False    # Also nullable=False in model
#         )
#         db.add(plan)
#         db.commit()
        
#         # Create subplans
#         subplan = KrollPlanSub(
#             PlanID=plan.id,
#             SubPlanCode="STANDARD",
#             Description="Standard Coverage",
#             DefaultGroupID="ONT",
#             # Add required non-nullable fields for subplan
#             DefSubPlan=False,
#             CarrierIDRO=False,
#             GroupRO=False,
#             ClientRO=False,
#             CPHARO=False,
#             RelRO=False,
#             ExpiryRO=False,
#             CarrierIDReq=False,
#             GroupReq=False,
#             ClientReq=False,
#             CPHAReq=False,
#             RelReq=False,
#             ExpiryReq=False,
#             DeductReq=False,
#             BirthReq=False
#         )
#         db.add(subplan)
#         db.commit()
        
#         # Link patients to plans
#         for patient in patients:
#             if patient.Prov == "ON":  # Only Ontario patients get OHIP
#                 patient_plan = KrollPatientPlan(
#                     PatID=patient.id,
#                     PlanID=plan.id,
#                     SubPlanID=subplan.id,
#                     Sequence=1
#                 )
#                 db.add(patient_plan)
#         db.commit()
        
#         # Create prescriptions
#         prescriptions = []
#         for i, patient in enumerate(patients):
#             rx = KrollRxPrescription(
#                 PatID=patient.id,
#                 DrgID=drugs[i % len(drugs)].id,
#                 RxNum=1000 + i,
#                 OrigRxNum=1000 + i,
#                 DIN=drugs[i % len(drugs)].DIN,
#                 FillDate=datetime.now() - timedelta(days=i*7),
#                 WrittenDate=datetime.now() - timedelta(days=i*7 + 1),
#                 DispQty=30,
#                 DaysSupply=30,
#                 UserInit="TEST",
#                 ManualPrice=False  # Required non-nullable field
#             )
#             db.add(rx)
#             prescriptions.append(rx)
#         db.commit()
        
#         # Create invoices
#         invoices = []
#         for i, rx in enumerate(prescriptions):
#             invoice = Invoice(
#                 patientId=rx.PatID,
#                 rxId=rx.id,
#                 invoiceDate=rx.FillDate,
#                 dueDate=rx.FillDate + timedelta(days=30),
#                 description=f"Prescription #{rx.RxNum}",
#                 amount=50.00 + i*10,
#                 insuranceCoveredAmount=30.00,
#                 patientPortion=20.00 + i*10
#             )
#             db.add(invoice)
#             invoices.append(invoice)
#         db.commit()
        
#         # Create payments
#         payments = []
#         for i, invoice in enumerate(invoices):
#             payment = Payment(
#                 patientId=invoice.patientId,
#                 amount=invoice.patientPortion,
#                 paymentDate=invoice.invoiceDate + timedelta(days=2),
#                 paymentMethod="credit",
#                 referenceNumber=f"REF{1000+i}"
#             )
#             db.add(payment)
#             payments.append(payment)
#         db.commit()
        
#         # Link payments to invoices
#         for payment, invoice in zip(payments, invoices):
#             payment_invoice = PaymentInvoice(
#                 paymentId=payment.id,
#                 invoiceId=invoice.id,
#                 amountApplied=payment.amount
#             )
#             db.add(payment_invoice)
            
#             # Update invoice status
#             invoice.amount_paid = payment.amount
#             invoice.status = "paid"
            
#         db.commit()
        
#         print("Database seeded successfully!")
        
#     except IntegrityError as e:
#         db.rollback()
#         print(f"Error seeding database: {e}")
#     finally:
#         db.close()

# if __name__ == "__main__":
#     init_db()  # Initialize database first (creates tables if they don't exist)
#     seed_database()
