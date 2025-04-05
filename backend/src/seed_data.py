# Create seed_data.py in your backend/src directory
from database import SessionLocal, init_db
from models.db import KrollPatient, KrollRxPrescription, Payment, Invoice, InvoiceItem
from datetime import datetime, timedelta
from decimal import Decimal

def seed_database():
    # Create a database session
    db = SessionLocal()
    
    try:
        # Create sample patients
        patient1 = KrollPatient(
            LastName="Smith", 
            FirstName="John",
            Prov="QC", 
            Country="Canada",
            Sex="M",
            Language="E",
            CreatedOn=datetime.now(),
            LastChanged=datetime.now(),
            Active=True
        )
        
        patient2 = KrollPatient(
            LastName="Doe", 
            FirstName="Jane",
            Prov="ON", 
            Country="Canada",
            Sex="F",
            Language="E",
            CreatedOn=datetime.now(),
            LastChanged=datetime.now(),
            Active=True
        )
        
        db.add_all([patient1, patient2])
        db.commit()
        
        # Create sample prescriptions
        rx1 = KrollRxPrescription(
            PatID=patient1.id,
            OrigRxNum=1001,
            RxNum=1001,
            FillDate=datetime.now(),
            DispQty=Decimal('30.000'),
            DIN="12345678",
            ManualPrice=False,
            UserInit="MG",
            WrittenDate=datetime.now() - timedelta(days=5)
        )
        
        rx2 = KrollRxPrescription(
            PatID=patient2.id,
            OrigRxNum=1002,
            RxNum=1002,
            FillDate=datetime.now(),
            DispQty=Decimal('60.000'),
            DIN="87654321",
            ManualPrice=False,
            UserInit="MG",
            WrittenDate=datetime.now() - timedelta(days=3)
        )
        
        db.add_all([rx1, rx2])
        db.commit()
        
        # Create sample invoices
        invoice1 = Invoice(
            patient_id=patient1.id,
            invoice_date=datetime.now(),
            due_date=datetime.now() + timedelta(days=30),
            total_amount=Decimal('75.50'),
            status='pending'
        )
        
        invoice2 = Invoice(
            patient_id=patient2.id,
            invoice_date=datetime.now(),
            due_date=datetime.now() + timedelta(days=30),
            total_amount=Decimal('125.75'),
            status='pending'
        )
        
        db.add_all([invoice1, invoice2])
        db.commit()
        
        # Create invoice items
        item1 = InvoiceItem(
            invoice_id=invoice1.id,
            description="Medication - RxNum: 1001",
            amount=Decimal('75.50')
        )
        
        item2 = InvoiceItem(
            invoice_id=invoice2.id,
            description="Medication - RxNum: 1002",
            amount=Decimal('125.75')
        )
        
        db.add_all([item1, item2])
        db.commit()
        
        # Create sample payments
        payment1 = Payment(
            patient_id=patient1.id,
            amount=Decimal('50.00'),
            payment_date=datetime.now(),
            payment_method='credit',
            reference_number='PAY-123456'
        )
        
        db.add(payment1)
        db.commit()
        
        print("Database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()