import pandas as pd
import json
import os
import sys
from pathlib import Path

# Add 'processing' to sys.path so we can import minio_cleaning
sys.path.append(os.path.abspath('processing'))
from minio_cleaning import (
    clean_title,
    clean_location,
    extract_contract,
    extract_remote,
    extract_education,
    extract_experience,
    extract_experience_level,
    extract_skills,
    extract_salary,
    extract_job_category,
    is_data_job,
    is_genuine_job_post,
    parse_date_smart
)

def load_local_data():
    all_data = []
    bronze_dir = Path("bronze") # Your local folder
    
    print(f"Reading local data from: {bronze_dir.absolute()}")
    
    for json_file in bronze_dir.rglob("offres.json"):
        with open(json_file, "r", encoding="utf-8") as f:
            content = f.read()
            # Handle JSONL or standard JSON
            try:
                data = [json.loads(line) for line in content.splitlines() if line.strip()]
            except:
                data = json.loads(content)
                if isinstance(data, dict): data = [data]
            
            # Extract source from folder name (e.g., bronze/linkedin/...)
            source_name = json_file.parts[1] 
            for d in data: d["source"] = source_name
            
            all_data.extend(data)
            print(f"Loaded {len(data)} items from {json_file}")
            
    return all_data

if __name__ == "__main__":
    data = load_local_data()
    df = pd.DataFrame(data)

    print("\nRAW SAMPLE DATA (location/region):")
    if "location" in df.columns and "region" in df.columns:
        print(df[["location", "region"]].head(10))
    elif "location" in df.columns:
        print(df[["location"]].head(10))
    elif "region" in df.columns:
        print(df[["region"]].head(10))

    # Fix for location vs region issue (same as in minio_cleaning.py)
    if "location" not in df.columns:
        df["location"] = pd.Series(dtype=str)
    if "region" in df.columns:
        df["location"] = df["location"].fillna(df["region"])

    # Apply your processing logic from minio_cleaning.py
    df["title"] = df["title"].fillna("").apply(clean_title)
    df["company"] = df["company"].fillna("confidentiel").str.strip().str.lower()
    df["description"] = df["description"].fillna("")
    df["location"] = df["location"].fillna("").astype(str)
    
    df["region"] = df["location"].apply(clean_location)
    df["published_time"] = df["published_time"].apply(parse_date_smart)
    df["contract"]   = df["description"].apply(extract_contract)
    df["remote"]     = df["description"].apply(extract_remote)
    df["education"]  = df["description"].apply(extract_education)
    df["experience"] = df["description"].apply(extract_experience)
    df["experience_level"] = df["experience"].apply(extract_experience_level)
    df["skills"]     = df["description"].apply(extract_skills)
    df["salaire"]    = df["description"].apply(extract_salary)
    df["job_category"] = df.apply(lambda row: extract_job_category(row.get("title", ""), row.get("description", "")), axis=1)
    
    df.drop_duplicates(subset=["title", "company", "source"], keep="first", inplace=True)

    # Save locally to 'silver' folder for testing
    os.makedirs("silver", exist_ok=True)
    df.to_parquet("silver/test_results.parquet", index=False)

    print(f"\nProcessing complete! {len(df)} rows saved to 'silver/test_results.parquet'")
    print(df[["title", "region", "salaire", "skills"]].head(10))