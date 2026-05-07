import json
import re
import argparse
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

# ══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

# Keywords to filter jobs (Data & AI focus)
TARGET_KEYWORDS = [
    "data engineer", "data scientist", "data analyst", "ai engineer", 
    "machine learning", "business intelligence", "data architect", 
    "big data", "dataops", "mlops", "ingénieur data", 
    "ingénieur données", "ingénieur ia"
]

# Signals for validation
MIN_DESCRIPTION_LEN = 50
JOB_SIGNALS = {"recrute", "recrutement", "offre", "job", "cdi", "cdd", "stage"}
NOISE_SIGNALS = {"webinar", "webinaire", "award", "félicitations", "congratulations"}

# ══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def is_data_or_ai_job(title: str, description: str) -> bool:
    """Filter: Only return True if it matches our Data/AI keywords."""
    text = (title + " " + description).lower()
    return any(keyword in text for keyword in TARGET_KEYWORDS)

def parse_french_date(time_str: str) -> str:
    """Calculates date based on French strings."""
    now = datetime.now()
    time_str = str(time_str).lower()
    try:
        digits = ''.join(filter(str.isdigit, time_str))
        num = int(digits) if digits else 1
        
        if 'jour' in time_str or 'j' in time_str:
            return (now - timedelta(days=num)).strftime("%d.%m.%Y")
        elif 'semaine' in time_str:
            return (now - timedelta(weeks=num)).strftime("%d.%m.%Y")
        elif 'mois' in time_str:
            return (now - timedelta(days=num * 30)).strftime("%d.%m.%Y")
        elif 'an' in time_str:
            return (now - timedelta(days=num * 365)).strftime("%d.%m.%Y")
        return now.strftime("%d.%m.%Y")
    except:
        return now.strftime("%d.%m.%Y")

def is_genuine_job_post(title: str, description: str) -> bool:
    text = (title + " " + description).lower()
    has_signal = any(s in text for s in JOB_SIGNALS)
    has_noise  = any(s in text for s in NOISE_SIGNALS)
    return has_signal and not has_noise

# ══════════════════════════════════════════════════════════════════════════════
# CORE CLEANING
# ══════════════════════════════════════════════════════════════════════════════

def clean_record(raw: dict) -> Optional[dict]:
    title = (raw.get("title") or "").strip()
    company = (raw.get("company") or "Non spécifié").strip()
    desc = (raw.get("description") or "").strip()
    loc = (raw.get("location") or "Non spécifié").strip()
    
    # Apply Filters
    if not is_data_or_ai_job(title, desc):
        return None
        
    if not is_genuine_job_post(title, desc):
        return None

    return {
        "title": title,
        "company": company,
        "location": loc,
        "published_time": parse_french_date(raw.get("published_time", "")),
        "description": desc[:1000] + "..." if len(desc) > 1000 else desc,
        "url": raw.get("url", "")
    }

def _cli_clean(input_path: Path, output_path: Path) -> None:
    """Reads input JSONL, cleans it, writes to output JSONL."""
    cleaned_records = []
    
    with open(input_path, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip(): continue
            try:
                raw = json.loads(line)
                cleaned = clean_record(raw)
                if cleaned:
                    cleaned_records.append(cleaned)
            except Exception as e:
                print(f"Skipping malformed line: {e}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        for rec in cleaned_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            
    print(f"✅ Success! Processed {len(cleaned_records)} relevant jobs.")

# ══════════════════════════════════════════════════════════════════════════════
# MAIN ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean LinkedIn job posts (bronze → silver)")
    
    # Update these paths to match your actual file locations
    parser.add_argument("--input", 
                        default="bronze/linkedin/2026/05/06/offres.json", 
                        help="Path to bronze JSONL file")
    parser.add_argument("--output", 
                        default="silver/linkedin/2026/05/06/offres.json", 
                        help="Path to silver JSONL output")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(f"❌ Error: File not found at {input_path}")
    else:
        _cli_clean(input_path, output_path)