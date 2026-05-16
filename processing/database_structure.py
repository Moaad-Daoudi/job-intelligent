from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from dotenv import load_dotenv
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# FIX: If running locally on Windows, use localhost. If in Docker, use postgres_db.
db_host = os.getenv("POSTGRES_HOST", "localhost")
if os.name == 'nt': # This detects if you are on Windows
    db_host = "localhost"

url = URL.create(
    "postgresql",
    username=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),
    host=db_host,
    port=int(os.getenv("POSTGRES_PORT", 5432)),
    database=os.getenv("POSTGRES_DB"),
)

engine = create_engine(url)

def init_gold_tables():
    print(f"Connecting to {db_host}...")
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS dim_companies (
                company_id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE,
                sector VARCHAR(255),
                website VARCHAR(255)
            );

            CREATE TABLE IF NOT EXISTS fact_jobs (
                job_id SERIAL PRIMARY KEY,
                company_id INT REFERENCES dim_companies(company_id),
                title VARCHAR(500),
                location VARCHAR(255),
                skills TEXT,
                contract_type VARCHAR(50),
                published_date DATE,
                url VARCHAR(1000) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
    print("✅ Tables created successfully.")

# --- ADD THIS LINE TO ACTUALLY RUN THE FUNCTION ---
if __name__ == "__main__":
    init_gold_tables()