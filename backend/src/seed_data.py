from models.db import (
    KrollPatient, KrollDrug, KrollPlan, KrollPlanSub, KrollPatientPlan,
    KrollRxPrescription, Invoice, Payment, PaymentInvoice
)
from database import SessionLocal, init_db
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
import random

def seed_database():
    """Seed the database with minimal test data"""
    db = SessionLocal()
    
    try:
        # Create patients
        patients = [
            KrollPatient(
                LastName="Smith", 
                FirstName="John",
                Prov="ON",
                Country="Canada",
                Sex="M",
                Language="E",
                CreatedOn=datetime.now(),
                LastChanged=datetime.now(),
                Active=True
            ),
            KrollPatient(
                LastName="Doe", 
                FirstName="Jane",
                Prov="QC",
                Country="Canada",
                Sex="F",
                Language="F",
                CreatedOn=datetime.now(),
                LastChanged=datetime.now(),
                Active=True
            ),
            KrollPatient(
                LastName="Brown", 
                FirstName="Michael",
                Prov="BC",
                Country="Canada",
                Sex="M",
                Language="E",
                CreatedOn=datetime.now(),
                LastChanged=datetime.now(),
                Active=True
            )
        ]
        
        for patient in patients:
            db.add(patient)
        db.commit()
        
        # Create drugs
        drugs = [
            KrollDrug(
                BrandName="Lipitor",
                GenericName="Atorvastatin",
                DIN="00123456789",
                Active=True,
                Schedule="Rx"
            ),
            KrollDrug(
                BrandName="Advil",
                GenericName="Ibuprofen",
                DIN="00987654321",
                Active=True,
                Schedule="OTC"
            )
        ]
        
        for drug in drugs:
            db.add(drug)
        db.commit()
        
        # Create plans - fix required fields
        plan = KrollPlan(
            PlanCode="OHIP",
            Description="Ontario Health Insurance Plan",
            Prov="ON",
            IsProvincialPlan=True,
            # Add required non-nullable fields
            AlternatePayee=False,  # From error message
            CheckCoverage=False    # Also nullable=False in model
        )
        db.add(plan)
        db.commit()
        
        # Create subplans
        subplan = KrollPlanSub(
            PlanID=plan.id,
            SubPlanCode="STANDARD",
            Description="Standard Coverage",
            DefaultGroupID="ONT",
            # Add required non-nullable fields for subplan
            DefSubPlan=False,
            CarrierIDRO=False,
            GroupRO=False,
            ClientRO=False,
            CPHARO=False,
            RelRO=False,
            ExpiryRO=False,
            CarrierIDReq=False,
            GroupReq=False,
            ClientReq=False,
            CPHAReq=False,
            RelReq=False,
            ExpiryReq=False,
            DeductReq=False,
            BirthReq=False
        )
        db.add(subplan)
        db.commit()
        
        # Link patients to plans
        for patient in patients:
            if patient.Prov == "ON":  # Only Ontario patients get OHIP
                patient_plan = KrollPatientPlan(
                    PatID=patient.id,
                    PlanID=plan.id,
                    SubPlanID=subplan.id,
                    Sequence=1
                )
                db.add(patient_plan)
        db.commit()
        
        # Create prescriptions
        prescriptions = []
        for i, patient in enumerate(patients):
            rx = KrollRxPrescription(
                PatID=patient.id,
                DrgID=drugs[i % len(drugs)].id,
                RxNum=1000 + i,
                OrigRxNum=1000 + i,
                DIN=drugs[i % len(drugs)].DIN,
                FillDate=datetime.now() - timedelta(days=i*7),
                WrittenDate=datetime.now() - timedelta(days=i*7 + 1),
                DispQty=30,
                DaysSupply=30,
                UserInit="TEST",
                ManualPrice=False  # Required non-nullable field
            )
            db.add(rx)
            prescriptions.append(rx)
        db.commit()
        
        # Create invoices
        invoices = []
        for i, rx in enumerate(prescriptions):
            invoice = Invoice(
                patient_id=rx.PatID,
                rx_id=rx.id,
                invoice_date=rx.FillDate,
                due_date=rx.FillDate + timedelta(days=30),
                description=f"Prescription #{rx.RxNum}",
                amount=50.00 + i*10,
                insurance_covered_amount=30.00,
                patient_portion=20.00 + i*10
            )
            db.add(invoice)
            invoices.append(invoice)
        db.commit()
        
        # Create payments
        payments = []
        for i, invoice in enumerate(invoices):
            payment = Payment(
                patient_id=invoice.patient_id,
                amount=invoice.patient_portion,
                payment_date=invoice.invoice_date + timedelta(days=2),
                payment_method="credit",
                reference_number=f"REF{1000+i}"
            )
            db.add(payment)
            payments.append(payment)
        db.commit()
        
        # Link payments to invoices
        for payment, invoice in zip(payments, invoices):
            payment_invoice = PaymentInvoice(
                payment_id=payment.id,
                invoice_id=invoice.id,
                amount_applied=payment.amount
            )
            db.add(payment_invoice)
            
            # Update invoice status
            invoice.amount_paid = payment.amount
            invoice.status = "paid"
            
        db.commit()
        
        print("Database seeded successfully!")
        
    except IntegrityError as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()  # Initialize database first (creates tables if they don't exist)
    seed_database()
