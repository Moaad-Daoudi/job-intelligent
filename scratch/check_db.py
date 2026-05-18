import pandas as pd
from sqlalchemy import create_engine
import sys

try:
    engine = create_engine('postgresql://user:password@localhost:5432/mydatabase')
    df = pd.read_sql("SELECT table_name FROM information_schema.tables WHERE table_schema='public'", engine)
    print("Tables in public schema:")
    print(df)
except Exception as e:
    print("Database connection failed:", e)
    sys.exit(1)
