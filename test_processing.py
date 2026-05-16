import pandas as pd
import json
import os
import re
from pathlib import Path
from io import BytesIO

# ══════════════════════════════════════════════════════════════════════════════
# 1. COPY-PASTE YOUR HELPER FUNCTIONS HERE
# ══════════════════════════════════════════════════════════════════════════════
# (Keep these exactly the same as in your minio_cleaning.py)

def extract_contract(text):
    text = str(text).lower()
    if any(x in text for x in ["cdi", "permanent"]): return "CDI"
    if "cdd" in text: return "CDD"
    if any(x in text for x in ["stage", "intern"]): return "Stage"
    if "alternance" in text or "apprentissage" in text: return "Alternance"
    return "Non spécifié"

def extract_skills(text):
    # This matches the list in your minio_cleaning.py
    skill_map = {
        "Python": ["python"], "SQL": ["sql"], "Azure": ["azure"], 
        "GCP": ["gcp", "google cloud"], "AWS": ["aws"], "Spark": ["spark", "pyspark"],
        "Docker": ["docker"], "Kubernetes": ["kubernetes", "k8s"], "Airflow": ["airflow"],
        "Power BI": ["power bi"], "Tableau": ["tableau"], "Git": ["git"]
    }
    found = [s for s, kw in skill_map.items() if any(k in str(text).lower() for k in kw)]
    return ", ".join(found) if found else "Non spécifié"

# [PASTE YOUR OTHER FUNCTIONS HERE: extract_remote, extract_education, extract_experience, is_data_job, etc.]

# ══════════════════════════════════════════════════════════════════════════════
# 2. LOCAL LOADER (Replaces MinIO connection)
# ══════════════════════════════════════════════════════════════════════════════
def load_local_data():
    all_data = []
    bronze_dir = Path("bronze") # Your local folder
    
    print(f"🔍 Reading local data from: {bronze_dir.absolute()}")
    
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
            print(f"✅ Loaded {len(data)} items from {json_file}")
            
    return all_data

# ══════════════════════════════════════════════════════════════════════════════
# 3. RUNNING THE PROCESSING (Exactly like your minio_cleaning.py)
# ══════════════════════════════════════════════════════════════════════════════
data = load_local_data()
df = pd.DataFrame(data)

print("\n🧾 RAW SAMPLE DATA:")
print(df[["title", "location"]].head(10))

print("\n📊 LOCATION NULL CHECK:")
print(df["location"].isna().sum(), "null locations")

# Apply your processing logic from minio_cleaning.py
df["description"] = df["description"].fillna("")
df["contract"] = df["description"].apply(extract_contract)
df["skills"] = df["description"].apply(extract_skills)

# Save locally to 'silver' folder for testing
os.makedirs("silver", exist_ok=True)
df.to_parquet("silver/test_results.parquet", index=False)

print(f"\n📊 Processing complete! {len(df)} rows saved to 'silver/test_results.parquet'")
print(df[["title", "contract", "skills"]].head(5))