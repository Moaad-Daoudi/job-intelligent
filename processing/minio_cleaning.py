"""
minio_cleaning.py  —  Bronze → Silver (script unique)
======================================================
Lit TOUTES les sources depuis MinIO Bronze,
applique le nettoyage + filtrage Data/AI,
et sauvegarde en Parquet dans MinIO Silver.

USAGE :
    python processing/minio_cleaning.py

Ce script remplace clean_jobs.py et l'ancien minio_cleaning.py.
"""

from minio import Minio
from minio.error import S3Error
import pandas as pd
import json
from io import BytesIO
from datetime import datetime, timedelta
from typing import Optional

# ══════════════════════════════════════════════════════════════════════════════
# 🔌 CONNEXION MINIO
# ══════════════════════════════════════════════════════════════════════════════
# docker-compose : ports 9001:9000 → l'API MinIO est sur localhost:9001
client = Minio(
    "localhost:9001",
    access_key="minioadmin",
    secret_key="miniopassword",
    secure=False
)

# ══════════════════════════════════════════════════════════════════════════════
# ⚙️  CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════
BUCKET_BRONZE = "bronze"
BUCKET_SILVER = "silver"
SOURCES       = ["rekrute", "linkedin", "emploi_ma", "khdma", "bayt"]
DAYS_TO_LOAD  = 7   # cherche les données des 7 derniers jours

# ── Keywords Data & AI (fusionné des deux scripts) ───────────────────────────
DATA_KEYWORDS = [
    # Data Engineering
    "data engineer", "data pipeline", "data platform", "data infrastructure",
    "etl", "elt", "data warehouse", "data lake", "data lakehouse",
    "dataops", "data integration", "data ops",
    "spark", "kafka", "airflow", "dbt", "hadoop", "hive", "flink",
    "databricks", "snowflake", "bigquery", "redshift",
    # Analytics & BI
    "data analyst", "business analyst", "business intelligence",
    "bi developer", "bi engineer", "analytique", "analytics",
    "data visualization", "tableau", "power bi", "looker", "metabase",
    # Data Science
    "data scientist", "data science", "data modeler", "data architect",
    "data steward", "data quality", "data governance", "data manager",
    "statistician", "predictive modeling", "forecasting",
    # ML & AI
    "machine learning", "ml engineer", "ai engineer", "deep learning",
    "nlp", "natural language processing", "computer vision",
    "generative ai", "large language model", "llm", "mlops",
    "reinforcement learning", "neural network",
    # Big Data
    "big data", "ingénieur données", "ingénieur data", "ingénieur big data",
    "analyste data", "analyste données", "ingénieur ia",
    "ingénieur intelligence artificielle",
    # Stages / internships
    "stage data", "stage ia", "stage big data", "pfe data",
    "alternance data", "alternance ia", "stagiaire data",
    "data intern", "analytics intern", "ml intern",
]

# ── Signaux pour valider qu'un post est une vraie offre d'emploi ─────────────
# (utilisé surtout pour LinkedIn qui scrape des posts de feed)
JOB_SIGNALS   = {"recrute", "recrutement", "offre", "job", "cdi", "cdd", "stage", "poste"}
NOISE_SIGNALS = {"webinar", "webinaire", "award", "félicitations", "congratulations",
                 "podcast", "article", "newsletter"}

# ══════════════════════════════════════════════════════════════════════════════
# 🛠️  HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def is_data_job(title: str, description: str = "") -> bool:
    """Retourne True si le titre ou la description contient un keyword Data/AI."""
    text = (title + " " + description).lower()
    return any(kw in text for kw in DATA_KEYWORDS)


def is_genuine_job_post(title: str, description: str = "") -> bool:
    """
    Pour LinkedIn : vérifie que le post est une vraie offre
    et pas un webinaire, award ou article.
    Pour les autres sources (Rekrute, Emploi.ma...) la description
    est souvent None → on retourne True directement.
    """
    if not description or len(description) < 30:
        return True  # pas assez de texte pour juger → on garde
    text = (title + " " + description).lower()
    has_signal = any(s in text for s in JOB_SIGNALS)
    has_noise  = any(s in text for s in NOISE_SIGNALS)
    return has_signal and not has_noise


def clean_region(raw_region: str, source: str) -> str:
    """
    Nettoie la région :
    - LinkedIn : "Casablanca, Casablanca-Settat, Maroc·il y a 2 jours·..." → "Casablanca, Casablanca-Settat, Maroc"
    - Rekrute  : "Casablanca (Maroc)" → "Casablanca (Maroc)"
    """
    if not raw_region or raw_region == "Non spécifié":
        return "Non spécifié"
    # Couper au premier "·" (parasite LinkedIn)
    clean = raw_region.split("·")[0].strip()
    return clean if clean else "Non spécifié"


def parse_french_date(time_str: str) -> str:
    """Convertit 'il y a 2 jours', '3d', '1 semaine' en date DD.MM.YYYY."""
    now = datetime.now()
    if not time_str or time_str == "Non spécifié":
        return now.strftime("%d.%m.%Y")
    s = str(time_str).lower()
    try:
        digits = ''.join(filter(str.isdigit, s))
        num = int(digits) if digits else 1
        if 'jour' in s or ('d' in s and 'j' not in s):
            return (now - timedelta(days=num)).strftime("%d.%m.%Y")
        elif 'semaine' in s or 'w' in s:
            return (now - timedelta(weeks=num)).strftime("%d.%m.%Y")
        elif 'mois' in s or 'mo' in s:
            return (now - timedelta(days=num * 30)).strftime("%d.%m.%Y")
        elif 'an' in s or 'year' in s:
            return (now - timedelta(days=num * 365)).strftime("%d.%m.%Y")
        elif 'h' in s or 'm' in s:
            return now.strftime("%d.%m.%Y")
    except Exception:
        pass
    return now.strftime("%d.%m.%Y")

# ══════════════════════════════════════════════════════════════════════════════
# 📦  CRÉATION BUCKETS
# ══════════════════════════════════════════════════════════════════════════════
for bucket in [BUCKET_BRONZE, BUCKET_SILVER]:
    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)
        print(f"✅ Bucket '{bucket}' créé.")
    else:
        print(f"📦 Bucket '{bucket}' existe déjà.")

# ══════════════════════════════════════════════════════════════════════════════
# 📥  1. LECTURE BRONZE (multi-sources, multi-dates)
# ══════════════════════════════════════════════════════════════════════════════
today      = datetime.now()
dates      = [(today - timedelta(days=i)).strftime("%Y/%m/%d") for i in range(DAYS_TO_LOAD)]
all_data   = []

for source in SOURCES:
    found = False
    for date_str in dates:
        path = f"{source}/{date_str}/offres.json"
        try:
            resp = client.get_object(BUCKET_BRONZE, path)
            content = resp.read().decode("utf-8")
            resp.close()
            resp.release_conn()

            # Supporte JSONL (une ligne = un objet) et JSON array
            try:
                lines = [l for l in content.splitlines() if l.strip()]
                data  = [json.loads(line) for line in lines]
            except json.JSONDecodeError:
                data = json.loads(content)
                if isinstance(data, dict):
                    data = [data]

            for d in data:
                d["source"]       = source
                d["scraped_date"] = date_str

            all_data.extend(data)
            print(f"  ✅ {source} / {date_str} — {len(data)} offres")
            found = True

        except S3Error as e:
            if e.code != "NoSuchKey":
                print(f"  ⚠️  MinIO erreur {source}/{date_str} : {e}")
        except Exception as e:
            print(f"  ❌ Erreur {source}/{date_str} : {e}")

    if not found:
        print(f"  ⚠️  Aucune donnée pour '{source}' sur les {DAYS_TO_LOAD} derniers jours.")

if not all_data:
    print("\n❌ Aucune donnée chargée. Lance d'abord les scrapers.")
    exit(1)

# ══════════════════════════════════════════════════════════════════════════════
# 🗂️  2. DATAFRAME
# ══════════════════════════════════════════════════════════════════════════════
df = pd.DataFrame(all_data)
print(f"\n📊 Brut : {df.shape[0]} lignes × {df.shape[1]} colonnes")

# ══════════════════════════════════════════════════════════════════════════════
# 🔥  3. CLEANING
# ══════════════════════════════════════════════════════════════════════════════

# 3a. Supprimer titres vides
df = df[df["title"].notna() & (df["title"].str.strip() != "")].copy()

# 3b. Normaliser texte
df["title"]   = df["title"].str.strip().str.lower()
df["company"] = df["company"].fillna("confidentiel").str.strip().str.lower()

# 3c. Unifier region + location
if "region" not in df.columns:
    df["region"] = ""
if "location" in df.columns:
    df["region"] = df["region"].fillna("").replace("", None).fillna(df["location"])

# 3d. Nettoyer la région (LinkedIn parasite)
df["region"] = df.apply(
    lambda row: clean_region(str(row.get("region", "") or ""), row.get("source", "")),
    axis=1
)

# 3e. Nettoyer la date publiée
df["published_time"] = df["published_time"].apply(
    lambda x: parse_french_date(str(x)) if pd.notna(x) else datetime.now().strftime("%d.%m.%Y")
)

# 3f. Remplir les NaN
df.fillna("Non spécifié", inplace=True)

# 3g. Déduplication
before = len(df)
df.drop_duplicates(subset=["title", "company", "source"], keep="first", inplace=True)
print(f"🔁 Doublons supprimés : {before - len(df)}")
print(f"📊 Après nettoyage   : {len(df)} offres")

# ══════════════════════════════════════════════════════════════════════════════
# 🎯  4. FILTRAGE — Offres Data/AI uniquement
# ══════════════════════════════════════════════════════════════════════════════
desc_col = "description" if "description" in df.columns else None

def row_is_data(row):
    title = str(row.get("title", ""))
    desc  = str(row.get("description", "")) if desc_col else ""
    return is_data_job(title, desc)

def row_is_genuine(row):
    title = str(row.get("title", ""))
    desc  = str(row.get("description", "")) if desc_col else ""
    return is_genuine_job_post(title, desc)

mask_data    = df.apply(row_is_data, axis=1)
mask_genuine = df.apply(row_is_genuine, axis=1)

df_silver   = df[mask_data & mask_genuine].copy()
df_excluded = df[~(mask_data & mask_genuine)]

print(f"\n🎯 Offres Data/AI retenues : {len(df_silver)} / {len(df)}")
print(f"🚫 Offres exclues          : {len(df_excluded)}")

# ══════════════════════════════════════════════════════════════════════════════
# 💾  5. SAUVEGARDE SILVER → MinIO (Parquet)
# ══════════════════════════════════════════════════════════════════════════════
if df_silver.empty:
    print("\n⚠️  Aucune offre Data trouvée. Silver non mis à jour.")
else:
    today_str  = today.strftime("%Y_%m_%d")
    silver_key = f"jobs_data_cleaned_{today_str}.parquet"

    buf = BytesIO()
    df_silver.to_parquet(buf, index=False, engine="pyarrow")
    buf.seek(0)

    client.put_object(
        BUCKET_SILVER,
        silver_key,
        data=buf,
        length=buf.getbuffer().nbytes,
        content_type="application/octet-stream"
    )
    print(f"\n✅ Silver sauvegardé : {BUCKET_SILVER}/{silver_key}")

# ══════════════════════════════════════════════════════════════════════════════
# 📋  6. RAPPORT
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "=" * 55)
print("📋  RAPPORT DE QUALITÉ")
print("=" * 55)
print(f"Total brut chargé    : {len(all_data)}")
print(f"Après déduplication  : {len(df)}")
print(f"Offres Data retenues : {len(df_silver)}")
print(f"Offres exclues       : {len(df_excluded)}")

if not df_silver.empty:
    print("\n📌 Top 15 titres retenus :")
    print(df_silver["title"].value_counts().head(15).to_string())

    print("\n📌 Répartition par source :")
    print(df_silver["source"].value_counts().to_string())

    print("\n📌 Top 10 régions :")
    print(df_silver["region"].value_counts().head(10).to_string())

if not df_excluded.empty:
    print("\n🚫 Échantillon titres exclus :")
    print(df_excluded["title"].value_counts().head(10).to_string())
