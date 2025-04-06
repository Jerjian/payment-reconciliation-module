# seed_data.py
import os
# Ensure the script can find the models and database modules
import sys
# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.db import (
    KrollPatient, KrollDrug, KrollPlan, KrollPlanSub, KrollPatientPlan,
    KrollRxPrescription, KrollRxPrescriptionPlan, KrollRxPrescriptionPlanAdj,
    Invoice, Payment, MonthlyStatement, FinancialStatement,
    KrollPatientPhone, KrollPatientAlg, KrollPatientCnd, KrollPatientCom,
    KrollDrugPack, KrollDrugPackInvHist, KrollDrugMix
)
from database import SessionLocal, init_db, DB_PATH
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
from decimal import Decimal
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def seed_database():
    """Seed the database with DETERMINISTIC test data using relationship-based approach."""
    logger.info("Starting database seeding (Deterministic)...")
    db = SessionLocal()
    try:
        # --- Clear Existing Data ---
        logger.info("Clearing existing data...")
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
        db.query(KrollDrugMix).delete()
        db.query(KrollPatientPhone).delete()
        db.query(KrollPatientAlg).delete()
        db.query(KrollPatientCnd).delete()
        db.query(KrollPatientCom).delete()
        db.query(MonthlyStatement).delete()
        db.query(FinancialStatement).delete()
        db.query(KrollPatient).delete()
        db.commit()
        logger.info("Existing data cleared.")

        # --- 1. Create Patients ---
        logger.info("Creating patients...")
        patients_data = [
             {"LastName":"Trudeau", "FirstName":"Justin", "Prov":"ON", "City":"Ottawa", "Sex":"M", "Language":"E", "Birthday":datetime(1971, 12, 25),"Address1":"123 Sussex Drive","Postal":"K1A0A3","Country":"Canada", "Code":"PAT1001", "NumRxs": 2, "HasCondition": True, "HasAllergy": False},
             {"LastName":"Horgan", "FirstName":"John", "Prov":"BC", "City":"Victoria", "Sex":"M", "Language":"E", "Birthday":datetime(1959, 8, 13),"Address1":"501 Belleville St","Postal":"V8V1X4","Country":"Canada", "Code":"PAT1002", "NumRxs": 1, "HasCondition": False, "HasAllergy": True},
             {"LastName":"Legault", "FirstName":"Francois", "Prov":"QC", "City":"Montreal", "Sex":"M", "Language":"F", "Birthday":datetime(1957, 5, 26),"Address1":"1045 Rue de la Gauchetière","Postal":"H3B2H4","Country":"Canada", "Code":"PAT1003", "NumRxs": 2, "HasCondition": False, "HasAllergy": False}
        ]
        patients_created = [] # Store created patient objects

        for i, p_data in enumerate(patients_data):
             patient = KrollPatient(
                LastName=p_data["LastName"],
                FirstName=p_data["FirstName"],
                Prov=p_data["Prov"],
                City=p_data["City"],
                Sex=p_data["Sex"],
                Language=p_data["Language"],
                Birthday=p_data["Birthday"],
                Address1=p_data["Address1"],
                Postal=p_data["Postal"],
                Country=p_data["Country"],
                CreatedOn=datetime.now(), # Consider adding defaults to model
                LastChanged=datetime.now(), # Consider adding defaults to model
                Active=True,
                Code=p_data["Code"]
             )

             # Add patient phones
             patient.patient_phones = [
                 KrollPatientPhone(
                    Description="Home",
                    Phone=f"555-010{i}",
                    LongDistance=False,
                    Type=0,
                    status='active', # Ensure this matches Enum in db.py
                    DateCreated=datetime.now(),
                    DateChanged=datetime.now()
                 )
             ]
             # Add patient comment
             patient.patient_coms = [
                 KrollPatientCom(
                    Topic="General",
                    Created=datetime.now(),
                    Changed=datetime.now(),
                    CommentPlainText="Patient preferences noted in file.",
                    ShowOnRx=True,
                    createdAt=datetime.now(), # Manual timestamp
                    updatedAt=datetime.now()  # Manual timestamp
                 )
             ]
             # Add condition conditionally
             if p_data["HasCondition"]:
                 patient.patient_cnds = [KrollPatientCnd(Code="E11.9", Comment="Type 2 Diabetes", Seq=1, Source=1, DateAdded=datetime.now(), createdAt=datetime.now(), updatedAt=datetime.now())]
             # Add allergy conditionally
             if p_data["HasAllergy"]:
                 patient.patient_algs = [KrollPatientAlg(Code="PNCI", Comment="Penicillin", Seq=1, Source=1, DateAdded=datetime.now(), CodeType=1, createdAt=datetime.now(), updatedAt=datetime.now())]

             db.add(patient)
             patients_created.append(patient)

        db.commit()
        logger.info(f"Created {len(patients_created)} patients with their related information.")

        # --- 2. Create Drugs & Drug Packs ---
        logger.info("Creating drugs and drug packs...")
        drugs_data = [
            {"BrandName":"Ozempic", "GenericName":"Semaglutide", "DIN":"02471464", "Schedule":"Rx", "Form":"Injection", "Strength":"1mg/dose", "Manufacturer":"Novo Nordisk", "Comment":"For type 2 diabetes, weight management"},
            {"BrandName":"Tylenol", "GenericName":"Acetaminophen", "DIN":"00559407", "Schedule":"OTC", "Form":"Tablet", "Strength":"500mg", "Manufacturer":"Johnson & Johnson", "Comment":"For pain and fever relief"}
        ]
        drugs_created = [] # Store created drug objects

        for d_data in drugs_data:
            drug = KrollDrug(
                BrandName=d_data["BrandName"],
                GenericName=d_data["GenericName"],
                DIN=d_data["DIN"],
                Active=True,
                Schedule=d_data["Schedule"],
                Form=d_data["Form"],
                Strength=d_data["Strength"],
                Manufacturer=d_data["Manufacturer"],
                Comment=d_data["Comment"],
                createdAt=datetime.now(), # Manual timestamp
                updatedAt=datetime.now()  # Manual timestamp
            )
            is_acetaminophen = (drug.GenericName == "Acetaminophen")
            drug.drug_packs = [
                KrollDrugPack(
                    QuickCode=f"{drug.DIN[:5]}PK", Active=True,
                    PackSize=Decimal('100.0') if is_acetaminophen else Decimal('1.0'),
                    PackUnit="Tablet" if is_acetaminophen else "Pen",
                    OnHandQty=Decimal('500.0') if is_acetaminophen else Decimal('10.0'),
                    AcqCost=Decimal('5.50') if is_acetaminophen else Decimal('150.75'),
                    SellingCost=Decimal('10.00') if is_acetaminophen else Decimal('250.00'),
                    Created=datetime.now(), Changed=datetime.now(),
                    createdAt=datetime.now(), updatedAt=datetime.now() # Manual timestamp
                )
            ]
            db.add(drug)
            drugs_created.append(drug)

        db.commit()
        logger.info(f"Created {len(drugs_created)} drugs with their drug packs.")

        # --- 3. Create Plans & SubPlans ---
        logger.info("Creating plans and subplans...")
        plans_data = [
            {"PlanCode":"OHIP", "Description":"Ontario Health Insurance Plan", "Prov":"ON", "IsProvincialPlan":True, "PharmacyID":"ONPHA001", "BIN":"610502"},
            {"PlanCode":"BCMSP", "Description":"BC Medical Services Plan", "Prov":"BC", "IsProvincialPlan":True, "PharmacyID":"BCPHA001", "BIN":"610402"},
            {"PlanCode":"RAMQ", "Description":"Régie de l'assurance maladie du Québec", "Prov":"QC", "IsProvincialPlan":True, "PharmacyID":"QCPHA001", "BIN":"610602"}
        ]
        subplan_codes = ["STANDARD", "PREMIUM"]
        plans_created = [] # Store created plan objects

        for p_data in plans_data:
            plan = KrollPlan(
                PlanCode=p_data["PlanCode"], Description=p_data["Description"], Prov=p_data["Prov"],
                IsProvincialPlan=p_data["IsProvincialPlan"], PharmacyID=p_data["PharmacyID"], BIN=p_data["BIN"],
                AlternatePayee=False, CheckCoverage=True, IsRealTime=True,
                createdAt=datetime.now(), updatedAt=datetime.now() # Manual timestamp
            )
            subplans = []
            for i, code in enumerate(subplan_codes):
                subplans.append(
                    KrollPlanSub(
                        SubPlanCode=code, Description=f"{code} Coverage ({plan.Prov})", DefSubPlan=(code == "STANDARD"),
                        CarrierIDRO=False, GroupRO=False, ClientRO=False, CPHARO=False, RelRO=False, ExpiryRO=False,
                        CarrierIDReq=(plan.Prov != 'ON'), GroupReq=True, ClientReq=True, CPHAReq=False, RelReq=True,
                        ExpiryReq=False, DeductReq=False, BirthReq=True, Active=True, AllowManualBilling=True,
                        createdAt=datetime.now(), updatedAt=datetime.now() # Manual timestamp
                    )
                )
            plan.subplans = subplans
            db.add(plan)
            plans_created.append(plan)

        db.commit()
        logger.info(f"Created {len(plans_created)} plans with {len(subplan_codes)} subplans each.")

        # --- 4. Link Patients to Plans using PatientPlan ---
        logger.info("Linking patients to plans...")
        patient_plans_created = [] # Store created patient plan objects
        for i, patient in enumerate(patients_created):
             matching_plan = db.query(KrollPlan).filter(KrollPlan.Prov == patient.Prov).first()
             if matching_plan:
                 subplan = db.query(KrollPlanSub)\
                    .filter(KrollPlanSub.PlanID == matching_plan.id,
                            KrollPlanSub.SubPlanCode == subplan_codes[i % len(subplan_codes)])\
                    .first()
                 if subplan:
                     patient_plan = KrollPatientPlan(
                        Sequence=1, Cardholder=f"{patient.FirstName} {patient.LastName}",
                        CarrierID="CARR01" if matching_plan.Prov == 'BC' else None,
                        GroupID=f"GRP{patient.Prov}001",
                        ClientID=f"{patient.LastName.upper()}{patient.FirstName[0]}{str(patient.Birthday.year)[-2:]}",
                        Rel="01", Birthday=patient.Birthday, PatSex=patient.Sex,
                        FirstName=patient.FirstName, LastName=patient.LastName,
                        AlwaysUseInRx=True, Deleted=False,
                        createdAt=datetime.now(), updatedAt=datetime.now() # Manual timestamp
                     )
                     patient_plan.patient = patient
                     patient_plan.plan = matching_plan
                     patient_plan.subplan = subplan
                     db.add(patient_plan)
                     patient_plans_created.append(patient_plan) # Store if needed later

        db.commit()
        logger.info("Linked patients to plans.")

        # --- 5. Create Prescriptions with Full Relationship Chain (Deterministic) ---
        logger.info("Creating DETERMINISTIC prescriptions with full relationship chain...")

        # Setup for financial tracking
        total_revenue = Decimal('0.0')
        total_insurance_payments = Decimal('0.0')
        total_patient_payments = Decimal('0.0')
        total_outstanding_patient_portion = Decimal('0.0')

        # Use a fixed start date for predictability
        current_fill_date = datetime(2025, 3, 1) # Start of March 2025

        # Base RxNum for uniqueness
        base_rx_num = 10000
        prescription_counter = 0
        payment_counter = 0 # For cycling payment methods
        payment_methods = ["credit", "debit", "cash"]

        # Define prescription scenarios deterministically
        # List of tuples: (patient_index, drug_index, should_pay_flag)
        rx_scenarios = [
            (0, 0, True),   # Patient 1 (Trudeau), Drug 1 (Ozempic), Pays
            (0, 1, False),  # Patient 1 (Trudeau), Drug 2 (Tylenol), No Pay
            (1, 0, True),   # Patient 2 (Horgan), Drug 1 (Ozempic), Pays
            (2, 1, False),  # Patient 3 (Legault), Drug 2 (Tylenol), No Pay
            (2, 0, True)    # Patient 3 (Legault), Drug 1 (Ozempic), Pays
        ]

        all_created_invoices = [] # Keep track of invoices created

        for scenario in rx_scenarios:
            patient_idx, drug_idx, should_pay = scenario
            patient = patients_created[patient_idx]
            drug = drugs_created[drug_idx]
            is_ozempic = (drug.BrandName == "Ozempic")

            # Get drug pack (ensure drugs_created includes drug packs)
            # Safer: Query the pack directly based on drug_id if needed, or assume first pack
            # Assuming the first (and only) drug pack added earlier
            drug_pack = db.query(KrollDrugPack).filter(KrollDrugPack.DrgID == drug.id).first()
            if not drug_pack:
                 logger.warning(f"DrugPack not found for Drug ID {drug.id}. Using default values.")
                 # Define default values or skip if critical
                 # For this example, we'll use defaults as in the original script

            # Basic prescription details
            disp_qty = Decimal('1.0') if is_ozempic else Decimal('90.0')
            days_supply = 28 if is_ozempic else 90

            # --- Pricing Simulation (remains same) ---
            base_cost = drug_pack.AcqCost if drug_pack else (Decimal('150.75') if is_ozempic else Decimal('5.50')) # Use correct AcqCost
            aac = base_cost * disp_qty # This assumes AcqCost is per PackUnit, which might not be right for Tylenol
            # Let's adjust pricing logic slightly for plausibility if pack not found
            if not drug_pack and is_ozempic: aac = Decimal('250.00') # Approx selling price used as cost base
            elif not drug_pack and not is_ozempic: aac = Decimal('0.10') * disp_qty # Approx cost per tab

            markup_percentage = Decimal('0.10')
            markup = round(aac * markup_percentage, 2)
            fee = Decimal('12.00')
            total_charge = round(aac + markup + fee, 2)

            # Create unique RxNum
            rx_num = base_rx_num + prescription_counter
            prescription_counter += 1

            # Create prescription
            prescription = KrollRxPrescription(
                OrigRxNum=rx_num, RxNum=rx_num, Init="SYS", UserInit="SEED",
                FillDate=current_fill_date,
                WrittenDate=current_fill_date - timedelta(days=2), # Fixed offset
                FirstFillDate=current_fill_date, LastFillDate=current_fill_date,
                DispQty=disp_qty, DaysSupply=days_supply, AuthQty=disp_qty * 3, RemQty=disp_qty * 2,
                Labels=1, ProductSelection=1,
                SIG=f"Take {'1 injection weekly' if is_ozempic else '1 tablet daily'}",
                DIN=drug.DIN,
                PackSize=drug_pack.PackSize if drug_pack else (Decimal('1.0') if is_ozempic else Decimal('100.0')),
                AAC=aac, Cost=aac, Markup=markup, Fee=fee,
                MixFee=Decimal('0.00'), SSCFee=Decimal('0.00'),
                PriceDiscount=Decimal('0.00'), DeductDiscount=Decimal('0.00'),
                ManualPrice=False, Status=1, AdjState=0, Inactive=False,
                createdAt=datetime.now(), updatedAt=datetime.now(), # Manual timestamp
                Charged=True
            )

            # Set relationships
            prescription.patient = patient
            prescription.drug = drug

            db.add(prescription)
            db.flush() # Need the prescription id

            # --- 6. Simulate Adjudication (Deterministic) ---
            patient_plan = db.query(KrollPatientPlan).filter(KrollPatientPlan.PatID == patient.id).first()
            insurance_pays = Decimal('0.00')
            adj_state = 0
            result_code = 'N/A'

            if patient_plan:
                if patient_plan.plan.IsProvincialPlan:
                    if is_ozempic:
                        insurance_pays = round(total_charge * Decimal('0.75'), 2)
                        adj_state = 1; result_code = 'PAY'
                    else:
                        insurance_pays = Decimal('0.00'); adj_state = 3; result_code = 'REJ'
                # else: # Logic for non-provincial if needed
                #     insurance_pays = round(total_charge * Decimal('0.80'), 2)
                #     adj_state = 1; result_code = 'PAY' # Example

                rx_plan = KrollRxPrescriptionPlan(
                    Seq=1, Pays=insurance_pays, TranType=1, AdjState=adj_state,
                    SubPlanCode=patient_plan.subplan.SubPlanCode, IsRT=True,
                    AdjDate=current_fill_date + timedelta(minutes=1),
                    createdAt=datetime.now(), updatedAt=datetime.now() # Manual timestamp
                )
                rx_plan.prescription = prescription
                rx_plan.patient_plan = patient_plan
                db.add(rx_plan)
                db.flush()

                rx_plan_adj = KrollRxPrescriptionPlanAdj(
                    TS=current_fill_date + timedelta(minutes=1), ResultCode=result_code,
                    AdjDate=current_fill_date + timedelta(minutes=1),
                    Cost=prescription.Cost, Markup=prescription.Markup, Fee=prescription.Fee,
                    MixFee=prescription.MixFee, SSCFee=prescription.SSCFee,
                    PlanPays=insurance_pays,
                    SubCost=prescription.Cost, SubMarkup=prescription.Markup, SubFee=prescription.Fee,
                    SubMixFee=prescription.MixFee, SubSSCFee=prescription.SSCFee,
                    PrevPaid=Decimal('0.00'), AdjudicationLevel=1, RxNum=prescription.RxNum,
                    Copay=total_charge - insurance_pays, Deductible=Decimal('0.00'), CoInsurance=Decimal('0.00'),
                    createdAt=datetime.now(), updatedAt=datetime.now() # Manual timestamp
                )
                rx_plan_adj.prescription_plan = rx_plan
                db.add(rx_plan_adj)
                prescription.AdjState = adj_state # Update Rx AdjState
            else:
                insurance_pays = Decimal('0.00')
                prescription.AdjState = 0 # Or appropriate state for no plan

            # --- 7. Create Invoice ---
            patient_portion = total_charge - insurance_pays
            invoice = Invoice(
                InvoiceDate=current_fill_date, DueDate=current_fill_date + timedelta(days=30),
                Description=f"Rx #{prescription.RxNum} {drug.BrandName}",
                Amount=total_charge, AmountPaid=Decimal('0.00'),
                InsuranceCoveredAmount=insurance_pays, PatientPortion=patient_portion,
                Status='pending',
                createdAt=datetime.now(), updatedAt=datetime.now() # Manual timestamp
            )
            invoice.patient = patient
            invoice.prescription = prescription
            db.add(invoice)
            db.flush()
            all_created_invoices.append(invoice) # Store invoice for reference

            # --- 8. Create Payments (Deterministic) ---
            payment_made = False
            payment_amount = Decimal('0.00')

            # Determine payment based on the 'should_pay' flag in the scenario
            if patient_portion > 0 and should_pay:
                payment_amount = patient_portion
                payment_method = payment_methods[payment_counter % len(payment_methods)]
                payment_counter += 1
                payment = Payment(
                    Amount=payment_amount,
                    PaymentDate=current_fill_date + timedelta(days=7), # Fixed offset
                    PaymentMethod=payment_method,
                    ReferenceNumber=f"PAY{invoice.id}DET", # Deterministic ref num
                    TransactionStatus='completed', Notes="Seed payment (Deterministic)",
                    createdAt=datetime.now(), updatedAt=datetime.now() # Manual timestamp
                )
                payment.patient = patient
                payment.invoice = invoice
                db.add(payment)
                payment_made = True
                invoice.AmountPaid = payment_amount
                invoice.Status = 'paid'

            # Update financial statement aggregates
            total_revenue += total_charge
            total_insurance_payments += insurance_pays
            if payment_made:
                total_patient_payments += payment_amount
            else:
                total_outstanding_patient_portion += patient_portion

            # Increment fill date for next Rx deterministically
            current_fill_date += timedelta(days=7) # Fixed increment

        db.commit()
        logger.info("Created DETERMINISTIC prescriptions with adjudication, invoices, and payments.")

        # --- 9. Generate Monthly Statements ---
        logger.info("Generating monthly statements...")
        # (Statement generation logic remains the same, uses fixed date queries now)
        statement_date = datetime(2025, 3, 31) # Fixed date for predictability
        start_date = datetime(2025, 3, 1)
        end_date = statement_date

        for patient in patients_created:
            patient_invoices = db.query(Invoice).filter(
                Invoice.PatientId == patient.id,
                Invoice.InvoiceDate >= start_date,
                Invoice.InvoiceDate <= end_date
            ).all()
            patient_payments = db.query(Payment).filter(
                Payment.PatientId == patient.id,
                Payment.PaymentDate >= start_date,
                Payment.PaymentDate <= end_date
            ).all()

            opening_balance = Decimal('0.00')
            charges = sum(inv.PatientPortion for inv in patient_invoices)
            payments_received = sum(pay.Amount for pay in patient_payments)
            closing_balance = opening_balance + charges - payments_received

            statement = MonthlyStatement(
                StatementDate=statement_date, StartDate=start_date, EndDate=end_date,
                OpeningBalance=opening_balance, TotalCharges=charges,
                TotalPayments=payments_received, ClosingBalance=closing_balance,
                createdAt=datetime.now() # Manual timestamp
            )
            statement.patient = patient
            db.add(statement)

        db.commit()
        logger.info("Generated monthly statements.")

        # --- 10. Generate Financial Statement ---
        logger.info("Generating financial statement...")
        # (Financial Statement generation logic remains the same)
        financial_statement = FinancialStatement(
            StatementDate=statement_date, StartDate=start_date, EndDate=end_date,
            TotalRevenue=total_revenue, InsurancePayments=total_insurance_payments,
            PatientPayments=total_patient_payments, OutstandingBalance=total_outstanding_patient_portion,
            createdAt=datetime.now() # Manual timestamp
        )
        db.add(financial_statement)
        db.commit()
        logger.info("Generated financial statement.")

        logger.info("Database seeding completed successfully! (Deterministic)")

    except IntegrityError as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}. Rolled back changes.")
        if hasattr(e, 'params') and hasattr(e, 'statement'):
            logger.error(f"Statement: {e.statement}")
            logger.error(f"Parameters: {e.params}")
    except Exception as e:
        db.rollback()
        logger.error(f"An unexpected error occurred: {e}. Rolled back changes.")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
        logger.info("Database session closed.")

if __name__ == "__main__":
    logger.info(f"Database file path: {DB_PATH}")
    # Check if DB file exists, prompt if user wants to re-initialize
    if os.path.exists(DB_PATH):
        # Initialize (creates tables if they don't exist)
        logger.info("Database file exists. Ensuring tables are created...")
        init_db()
        confirm = input("Database already exists. Do you want to clear it and re-seed? (yes/no): ")
        if confirm.lower() == 'yes':
            seed_database()
        else:
            logger.info("Seeding cancelled.")
    else:
        logger.info("Database file does not exist. Initializing and seeding...")
        init_db()  # Initialize database first
        seed_database()
