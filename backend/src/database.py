# Database initialization
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from models.db import Base

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'pharmacy.db')
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create engine
engine = create_engine(DATABASE_URL, echo=True)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Function to get a database session
def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

# Initialize database (create tables)
def init_db():
    Base.metadata.create_all(bind=engine)
    print(f"Database initialized at {DB_PATH}")

if __name__ == "__main__":
    init_db()