import pandas as pd
import io
from minio import Minio
from sqlalchemy import create_engine, text
import os
from urllib.parse import urlparse
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env", override=True)

env_mode = os.getenv("ENVIRONMENT", "local")

print("--- DATABASE CONNECTION DEBUG ---")
print(f"Active OS Name: {os.name}")
print(f"DB_HOST: {os.getenv('DB_HOST')}")
print(f"DB_NAME: {os.getenv('DB_NAME')}")
print(f"POSTGRES_HOST: {os.getenv('POSTGRES_HOST')}")
print("---------------------------------")

minio_endpoint = os.getenv("MINIO_ENDPOINT", "http://minio:9000")
parsed_url = urlparse(minio_endpoint)
minio_host = parsed_url.netloc 

client = Minio(
    minio_host,
    access_key=os.getenv("MINIO_ROOT_USER", "minioadmin"),
    secret_key=os.getenv("MINIO_ROOT_PASSWORD", "miniopassword"),
    secure=False
)

if env_mode == "production":
    print("🚀 Connecting to ONLINE Neon Database...")
    db_user = os.getenv('DB_USER')
    db_pass = os.getenv('DB_PASS')
    db_host = os.getenv('DB_HOST')
    db_port = os.getenv('DB_PORT', 5432)
    db_name = os.getenv('DB_NAME')
else:
    print("💻 Connecting to LOCAL PostgreSQL Container...")
    db_user = os.getenv('POSTGRES_USER', 'user')
    db_pass = os.getenv('POSTGRES_PASSWORD', 'password')
    db_host = os.getenv('POSTGRES_HOST', 'postgres_db')
    db_port = os.getenv('POSTGRES_PORT', 5432)
    db_name = os.getenv('POSTGRES_DB', 'mydatabase')

engine = create_engine(f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}")

def init_gold_tables():
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
    print("✅ Schema initialized.")

init_gold_tables()

today_str = pd.Timestamp.now().strftime('%Y_%m_%d')
silver_key = f"jobs_data_cleaned_{today_str}.parquet"

try:
    response = client.get_object("silver", silver_key)
    df = pd.read_parquet(io.BytesIO(response.read()))
    
    companies = df[['company', 'company_sector', 'company_website']].drop_duplicates().rename(columns={'company': 'name', 'company_sector': 'sector', 'company_website': 'website'})
    
    # Get existing companies from DB
    existing_companies = pd.read_sql("SELECT name FROM dim_companies", engine)
    existing_names = existing_companies['name'].tolist()
    
    # Filter: Keep only companies NOT in existing_names
    new_companies = companies[~companies['name'].isin(existing_names)]
    
    if not new_companies.empty:
        new_companies.to_sql('dim_companies', engine, if_exists='append', index=False, method='multi')
        print(f"✅ Added {len(new_companies)} new companies.")

    # --- B. Prepare Fact Table ---
    # Refresh ID mapping from DB (now includes new ones)
    db_companies = pd.read_sql("SELECT company_id, name FROM dim_companies", engine)
    df = df.merge(db_companies, left_on='company', right_on='name', how='left')
    
    fact_df = df[['company_id', 'title', 'location', 'skills', 'contract', 'published_time', 'url']]
    fact_df = fact_df.rename(columns={'contract': 'contract_type', 'published_time': 'published_date'})
    fact_df['published_date'] = pd.to_datetime(fact_df['published_date'], dayfirst=True)
    
    # --- C. Load Fact Table (Skip duplicates) ---
    # Get existing URLs from DB
    existing_urls = pd.read_sql("SELECT url FROM fact_jobs", engine)
    existing_url_list = set(existing_urls["url"].tolist())

    fact_df = fact_df.drop_duplicates(subset=["url"])

    new_jobs = fact_df[~fact_df["url"].isin(existing_url_list)]
    
    if not new_jobs.empty:
        new_jobs.to_sql('fact_jobs', engine, if_exists='append', index=False)
        print(f"✅ Added {len(new_jobs)} new jobs.")
    else:
        print("ℹ️ No new jobs to add.")

except Exception as e:
    print(f"❌ Error in Gold loading: {e}")