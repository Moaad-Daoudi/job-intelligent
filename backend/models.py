from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, create_engine, text
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False) # 'candidate' or 'recruiter'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Candidate profile fields
    phone = Column(String(20), nullable=True)
    title = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    resume_url = Column(Text, nullable=True)
    
    # Recruiter company linkage
    company_id = Column(Integer, nullable=True)

class Company(Base):
    __tablename__ = 'companies'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    industry = Column(String(100))
    location = Column(String(100))
    employees = Column(String(50))
    website = Column(String(200))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class SavedJob(Base):
    __tablename__ = 'saved_jobs'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    job_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class JobApplication(Base):
    __tablename__ = 'job_applications'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    job_id = Column(Integer, nullable=False)
    status = Column(String(50), default="Applied") # "Applied", "Reviewing", "Interviewing", "Accepted", "Rejected"
    applied_at = Column(DateTime, default=datetime.utcnow)
    cover_letter = Column(Text, nullable=True)

# Connect to database
engine = create_engine("postgresql://user:password@localhost:5432/mydatabase")

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)
    # Perform raw SQL migrations to ensure columns exist on older user tables
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(100)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS resume_url TEXT"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INTEGER"))
        conn.execute(text("ALTER TABLE fact_jobs ADD COLUMN IF NOT EXISTS description TEXT"))
        
        # Check if default admin exists, if not, automatically seed it
        admin_exists = conn.execute(text("SELECT 1 FROM users WHERE email = 'admin@example.com'")).scalar()
        if not admin_exists:
            # Pre-hashed bcrypt password for 'password123'
            hashed_pwd = "$2b$12$R9h/lIPsI1i6kyEzV7m6deC.Y1Vusw8J1QnE8W15S9u775WbW2.pG"
            conn.execute(text(
                "INSERT INTO users (first_name, last_name, email, password_hash, role, created_at) "
                "VALUES ('Super', 'Admin', 'admin@example.com', :pwd, 'admin', NOW())"
            ), {"pwd": hashed_pwd})
            
        conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database tables initialized successfully!")
