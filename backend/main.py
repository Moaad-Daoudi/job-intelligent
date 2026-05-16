from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
import pandas as pd

app = FastAPI()

# Allow React to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_engine("postgresql://user:password@localhost:5432/job_db")

@app.get("/jobs")
def get_jobs(city: str = None):
    query = "SELECT * FROM fact_jobs"
    if city:
        query += f" WHERE location = '{city}'"
    df = pd.read_sql(query, engine)
    return df.to_dict(orient="records")

@app.get("/jobs/{job_id}")
def get_job(job_id: int):
    # return single job row from fact_jobs join dim_companies

# Run with: uvicorn main:app --reload