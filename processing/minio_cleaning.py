import pandas as pd
import json
import re
import os
from io import BytesIO
from datetime import datetime, timedelta
from minio import Minio
from minio.error import S3Error
import unicodedata

# ══════════════════════════════════════════════════════════════════════════════
# 🔌 CONFIGURATION & CONNEXION
# ══════════════════════════════════════════════════════════════════════════════
from urllib.parse import urlparse

minio_endpoint = os.getenv("MINIO_ENDPOINT", "minio:9000")

parsed_url = urlparse(minio_endpoint)
minio_host = parsed_url.netloc

client = Minio(
    minio_host,
    access_key=os.getenv("MINIO_ROOT_USER", "minioadmin"),
    secret_key=os.getenv("MINIO_ROOT_PASSWORD", "miniopassword"),
    secure=False
)

BUCKET_BRONZE = "bronze"
BUCKET_SILVER = "silver"
SOURCES       = ["rekrute", "linkedin", "emploi_ma", "khdma", "bayt"]
DAYS_TO_LOAD  = 7

# Keywords for Filtering (The "Broad" search)
DATA_KEYWORDS = [
    # Data Engineering
    "data engineer", "data pipeline", "data platform", "data infrastructure",
    "etl", "elt", "data warehouse", "data lake", "data lakehouse",
    "data mesh", "dataops", "data integration",
    "spark", "kafka", "airflow", "dbt", "hadoop", "hive", "flink",
    "databricks", "snowflake", "bigquery", "redshift",
    # Analytics & BI
    "data analyst", "business analyst", "business intelligence",
    "bi developer", "bi engineer", "reporting analyst",
    "data visualization", "tableau", "power bi", "looker", "metabase", "qlik",
    # Data Science
    "data scientist", "data science", "data modeler",
    "statistician", "quantitative analyst", "predictive modeling",
    "forecasting", "a/b testing", "statistical analysis",
    # ML & AI
    "machine learning", "ml engineer", "ai engineer",
    "deep learning", "neural network", "nlp", "natural language processing",
    "computer vision", "reinforcement learning", "generative ai",
    "large language model", "llm", "prompt engineer", "rag",
    "ai researcher", "research scientist", "applied scientist",
    "mlops", "model deployment", "feature engineering",
    # Governance & Architecture
    "data architect", "data governance", "data quality",
    "data steward", "data catalog", "master data management", "mdm",
    # Tools & Cloud
    "python", "sql", "scala", "pyspark",
    "aws", "azure", "gcp", "cloud data", "kubernetes", "docker", "terraform",
    # French — Engineering
    "ingénieur data", "ingénieur données", "ingénieur big data",
    "développeur big data", "data engineer confirmé", "data engineer senior",
    "stockage", "base de données",
    # French — Analytics & BI
    "analyste data", "analyste de données", "informatique décisionnelle",
    "développeur bi", "consultant bi",
    # French — AI & Science
    "ingénieur ia", "ingénieur intelligence artificielle",
    "consultant ia", "data scientist senior",
    # French — Internships
    "stage data", "stage ia", "stage big data", "pfe data",
    "alternance data", "alternance ia", "stagiaire data", "stagiaire ia",
    # English — Internships
    "data intern", "analytics intern", "ml intern", "ai intern",
    "junior data", "entry level data",
    
# ── Data Profiles (English) ───────────────────────────────────────────────
    "data engineer",
    "data analyst",
    "data scientist",
    "data architect",
    "analytics engineer",
    "BI developer",
    "ETL developer",

    # ── AI / ML Profiles (English) ────────────────────────────────────────────
    "machine learning engineer",
    "MLOps engineer",
    "NLP engineer",
    "LLM engineer",
    "deep learning engineer",
    "AI engineer",
    "generative AI",
    "RAG engineer",
    "computer vision engineer",

    # ── Data Profiles (French) ────────────────────────────────────────────────
    "ingénieur data",
    "analyste data",
    "data scientist",
    "ingénieur big data",
    "développeur BI",
    "architecte data",
    "consultant data",

    # ── AI / ML Profiles (French) ─────────────────────────────────────────────
    "ingénieur IA",
    "ingénieur machine learning",
    "ingénieur NLP",
    "MLOps",
    "deep learning",
    "LLM",
    "IA générative",

    # ── Internships ─────────────────────────
    "stage data",
    "stage IA",
    "stage big data",
    "alternance data",
    "alternance IA",
    "PFE data",
    "PFE intelligence artificielle",
    "stagiaire data",
    "stagiaire IA",

    # ── Internships (English) ────────────────────────────────────────────────
    "data intern",
    "machine learning intern",
    "AI intern",

    # ── Tools ────────────────────────────────
    "Power BI",
    "Databricks",
    "Snowflake",
    "Python data",
    "SQL data",
]

JOB_SIGNALS   = {"recrute", "recrutement", "offre", "job", "cdi", "cdd", "stage", "poste"}
NOISE_SIGNALS = {
    "webinar", "webinaire", "award", "podcast", "article", "newsletter", 
    "recette", "recipe", "management", "leadership", "conseil", 
    "astuce", "transformation", "hashtag"
}

morocco_regions = {
    "Tanger-Tétouan-Al Hoceïma": ["Tangier", "Tétouan", "Al Hoceïma", "Chefchaouen", "Larache", "Ouazzane"],
    "L'Oriental": ["Oujda", "Nador", "Berkane", "Taourirt", "Figuig", "Guercif"],
    "Fès-Meknès": ["Fès", "Meknès", "Ifrane", "Sefrou", "Taza", "Moulay Yacoub"],
    "Rabat-Salé-Kénitra": ["Rabat", "Salé", "Kénitra", "Temara", "Sidi Kacem", "Sidi Slimane"],
    "Béni Mellal-Khénifra": ["Béni Mellal", "Khénifra", "Azilal", "Fquih Ben Salah", "Khouribga"],
    "Casablanca-Settat": ["Casablanca", "Settat", "El Jadida", "Mohammedia", "Berrechid", "Benslimane"],
    "Marrakech-Safi": ["Marrakech", "Safi", "Essaouira", "Kelaat Sraghna", "Youssoufia", "Chichaoua"],
    "Drâa-Tafilalet": ["Errachidia", "Ouarzazate", "Midelt", "Tinghir", "Zagora"],
    "Souss-Massa": ["Agadir", "Taroudant", "Tiznit", "Tata", "Inezgane", "Chtouka-Ait Baha"],
    "Guelmim-Oued Noun": ["Guelmim", "Tan-Tan", "Sidi Ifni", "Assa-Zag"],
    "Laâyoune-Sakia El Hamra": ["Laâyoune", "Smara", "Boujdour", "Tarfaya"],
    "Dakhla-Oued Ed-Dahab": ["Dakhla", "Aousserd"]
}

# ══════════════════════════════════════════════════════════════════════════════
# 🛠️ HELPERS (Cleaning & Enrichment)
# ══════════════════════════════════════════════════════════════════════════════

def clean_title(text: str) -> str:
    if not isinstance(text, str):
        return ""

    # Lowercase
    text = text.lower()

    # Remove accents safely
    text = ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )

    # Remove tags like [maroc][casablanca]
    text = re.sub(r"\[.*?\]", " ", text)

    # Remove H/F
    text = re.sub(r"\b(h\/f|hf|h\.f)\b", " ", text)

    # Remove emojis and strange symbols
    text = re.sub(r"[^\w\s\-\/]", " ", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text

def normalize(text):
    if not isinstance(text, str): return ""
    # Normalize unicode to decompose characters, then remove non-spacing marks
    normalized = unicodedata.normalize('NFD', text)
    shout = "".join([c for c in normalized if unicodedata.category(c) != 'Mn'])
    return shout.lower()

def clean_location(location_str):
    print("🔎 INPUT:", location_str)  # DEBUG LINE

    if not location_str or pd.isna(location_str) or location_str == "None":
        print("➡️ EMPTY LOCATION")
        return "National / Autre"

    city_raw = str(location_str).split('·')[0].split(',')[0].strip()
    print("🏙️ CITY RAW:", city_raw)

    norm_city = normalize(city_raw)
    print("⚙️ NORMALIZED:", norm_city)

    for region, cities in morocco_regions.items():
        for city in cities:
            if normalize(city) == norm_city:
                print("✅ MATCH FOUND:", region)
                return region

    if "maroc" in normalize(location_str):
        print("🇲🇦 FALLBACK NATIONAL")
        return "National / Autre"

    print("❌ NO MATCH → AUTRE")
    return "Autre / International"
    
    # Fallback if "Maroc" is mentioned but no city matches
    if "maroc" in normalize(location_str):
        return "National / Autre"
        
    return "Autre / International"

def extract_contract(text):
    text = text.lower()
    if any(x in text for x in ["cdi", "permanent"]): return "CDI"
    if "cdd" in text: return "CDD"
    if any(x in text for x in ["stage", "intern"]): return "Stage"
    if "alternance" in text or "apprentissage" in text: return "Alternance"
    if "freelance" in text or "indépendant" in text: return "Freelance"
    return "Non spécifié"

def extract_remote(text):
    text = text.lower()
    if any(x in text for x in ["full remote", "100% remote", "télétravail total"]): return "Full Remote"
    if any(x in text for x in ["hybride", "hybrid", "remote friendly"]): return "Hybride"
    if any(x in text for x in ["sur site", "on-site", "présentiel"]): return "On-site"
    return "Non spécifié"

def extract_education(text):
    text = text.lower()
    if any(x in text for x in ["bac+5", "master", "ingénieur"]): return "Bac+5"
    if any(x in text for x in ["bac+3", "licence", "bachelor"]): return "Bac+3"
    if any(x in text for x in ["phd", "doctorat"]): return "PhD"
    return "Non spécifié"

def extract_experience(text):
    match = re.search(r'(\d+)\s*(?:\+| à |-| to )?\s*(\d+)?\s*(?:ans|years)', text, re.IGNORECASE)
    return f"{match.group(1)} ans" if match else "Non spécifié"

def extract_skills(text):
    # Expanded skill taxonomy for Data/AI/DevOps
    skill_map = {
        # Data Engineering & BI
        "Python": ["python"],
        "SQL": ["sql"],
        "PySpark": ["pyspark", "spark"],
        "ETL/ELT": ["etl", "elt", "pipeline"],
        "BigQuery": ["bigquery"],
        "Snowflake": ["snowflake"],
        "Databricks": ["databricks"],
        "Power BI": ["power bi"],
        "Tableau": ["tableau"],
        "Kafka": ["kafka"],
        "Airflow": ["airflow"],
        "dbt": ["dbt"],
        
        # Cloud & DevOps
        "Azure": ["azure"],
        "GCP": ["gcp", "google cloud"],
        "AWS": ["aws", "amazon web services"],
        "Kubernetes": ["kubernetes", "k8s"],
        "Docker": ["docker"],
        "Terraform": ["terraform"],
        "Git": ["git"],
        "CI/CD": ["ci/cd", "jenkins", "gitlab ci"],
        "Linux": ["linux", "bash", "shell"],
        
        # Development / Backend
        "Java": ["java", "jee"],
        "Spring Boot": ["spring boot"],
        "React": ["react"],
        "Node.js": ["node.js", "nodejs"],
        "PHP": ["php"],
        ".NET": [".net", "c#"],
        "Angular": ["angular"],
        "Vue.js": ["vue.js", "vuejs"],
        
        # Data Science / AI
        "Machine Learning": ["machine learning", "ml"],
        "Deep Learning": ["deep learning"],
        "NLP": ["nlp", "natural language processing"],
        "TensorFlow": ["tensorflow"],
        "PyTorch": ["pytorch"],
        "Scikit-Learn": ["scikit-learn", "sklearn"],
        "LLM": ["llm", "large language model"],
        "Computer Vision": ["computer vision"]
    }
    
    text_lower = text.lower()
    found = []
    
    # Check for keywords
    for skill, keywords in skill_map.items():
        if any(kw in text_lower for kw in keywords):
            found.append(skill)
            
    return ", ".join(found) if found else "Non spécifié"

def is_data_job(title, description=""):
    text = (title + " " + description).lower()
    title_n = normalize(title)
    desc_n = normalize(description)

    return (
        any(normalize(kw) in title_n for kw in DATA_KEYWORDS) or
        any(normalize(kw) in desc_n for kw in DATA_KEYWORDS)
    )

def parse_date_smart(date_str):
    now = datetime.now()
    if not date_str or pd.isna(date_str) or date_str == "None" or date_str == "Non spécifié": 
        return now.strftime("%d.%m.%Y")
    
    s = str(date_str).lower()
    
    if re.match(r'\d{2}\.\d{2}\.\d{4}', s):
        return s
    
    try:
        nums = re.findall(r'\d+', s)
        num = int(nums[0]) if nums else 1
        
        if any(x in s for x in ['jour', 'd ']): return (now - timedelta(days=num)).strftime("%Y-%m-%d")
        if any(x in s for x in ['semaine', 'w']): return (now - timedelta(weeks=num)).strftime("%Y-%m-%d")
        if any(x in s for x in ['heure', 'h']): return now.strftime("%d.%m.%Y")
        if any(x in s for x in ['minute', 'm']): return now.strftime("%d.%m.%Y")
    except: 
        pass
    
    return now.strftime("%d.%m.%Y")

def is_genuine_job_post(title, description=""):
    text = (title + " " + description).lower()
    if any(n in text for n in NOISE_SIGNALS):
        return False
    has_signal = any(s in text for s in JOB_SIGNALS)
    is_long_enough = len(description) > 10    
    return has_signal and is_long_enough

# ══════════════════════════════════════════════════════════════════════════════
# 🚀 MAIN PIPELINE
# ══════════════════════════════════════════════════════════════════════════════

# 1. Bucket Setup
for bucket in [BUCKET_BRONZE, BUCKET_SILVER]:
    if not client.bucket_exists(bucket): client.make_bucket(bucket)

# 2. Loading
today = datetime.now()
dates = [(today - timedelta(days=i)).strftime("%Y/%m/%d") for i in range(DAYS_TO_LOAD)]
all_data = []

for source in SOURCES:
    for date_str in dates:
        path = f"{source}/{date_str}/offres.json"
        try:
            resp = client.get_object(BUCKET_BRONZE, path)
            content = resp.read().decode("utf-8")
            resp.close()
            
            try:
                lines = [l for l in content.splitlines() if l.strip()]
                data = [json.loads(line) for line in lines]
            except:
                data = json.loads(content)
                if isinstance(data, dict): data = [data]
            
            for d in data: d["source"] = source
            all_data.extend(data)
            print(f"✅ Loaded {source} ({date_str})")
        except Exception: pass

# 3. Processing
df = pd.DataFrame(all_data)
if df.empty:
    print("❌ No data found.")
    exit(1)
    
print("\n🧪 UNIQUE LOCATIONS SAMPLE:")
print(df["location"].dropna().unique()[:20])


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
df["skills"]     = df["description"].apply(extract_skills)
df.drop_duplicates(subset=["title", "company", "source"], keep="first", inplace=True)

print("\n📍 REGION SAMPLE OUTPUT:")
print(df[["location", "region"]].head(15))

print("\n❌ UNMATCHED LOCATIONS:")
print(df[df["region"] == "Autre / International"]["location"].head(20))

# 4. Filtering
mask_data = df.apply(lambda row: is_data_job(row.get("title", ""), row.get("description", "")), axis=1)
mask_gen  = df.apply(lambda row: is_genuine_job_post(row.get("title", ""), row.get("description", "")), axis=1)
df_silver = df[mask_data | mask_gen]

# 5. Save
if not df_silver.empty:
    silver_key = f"jobs_data_cleaned_{today.strftime('%Y_%m_%d')}.parquet"
    buf = BytesIO()
    df_silver.to_parquet(buf, index=False)
    buf.seek(0)
    client.put_object(BUCKET_SILVER, silver_key, data=buf, length=buf.getbuffer().nbytes)
    print(f"\n✅ Silver saved: {silver_key}")
    print(f"📊 Final rows: {len(df_silver)}")
    
# Calculate counts
total_rows = len(df)
clean_rows = len(df_silver)
noisy_rows = total_rows - clean_rows

print(f"\n--- Processing Statistics ---")
print(f"Total raw records loaded: {total_rows}")
print(f"Clean records (Silver): {clean_rows}")
print(f"Noisy/Discarded records: {noisy_rows}")
print(f"Filter rate: { (noisy_rows/total_rows)*100:.2f}% discarded")