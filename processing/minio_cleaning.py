from minio import Minio
import pandas as pd
import json
from io import BytesIO

# 🔌 Connexion MinIO
client = Minio(
    "localhost:9001",
    access_key="minioadmin",
    secret_key="miniopassword",
    secure=False
)

# 📂 Sources multiples
sources = ["rekrute", "linkedin", "emploi_ma"]
all_data = []

# 📥 1. Lecture Bronze (multi-sources)
for source in sources:
    path = f"{source}/2026/04/29/offres.json"
    
    try:
        response = client.get_object("bronze", path)
        content = response.read().decode("utf-8")
        response.close()
        response.release_conn()

        try:
            data = json.loads(content)
        except:
            data = [json.loads(line) for line in content.splitlines() if line.strip()]

        for d in data:
            d["source"] = source

        all_data.extend(data)
        print(f"{source} chargé ✅ ({len(data)} offres)")

    except Exception as e:
        print(f"Erreur avec {source} ❌ :", e)

# Convertir en DataFrame
df = pd.DataFrame(all_data)
print("Avant nettoyage :", df.shape)

# 🔥 2. CLEANING
df = df[df["title"].notna() & (df["title"] != "")]

df["title"]   = df["title"].str.strip().str.lower()
df["company"] = df["company"].str.strip().str.lower()
df["region"]  = df["region"].str.strip()

df.fillna("Non spécifié", inplace=True)
df.drop_duplicates(subset=["title", "company", "source"], inplace=True)

print("Après nettoyage :", df.shape)

# 🎯 3. FILTRAGE — Offres Data uniquement
DATA_KEYWORDS = [
    "data engineer",
    "data analyst",
    "data scientist",
    "data manager",
    "data architect",
    "data steward",
    "data ops",
    "dataops",
    "machine learning",
    "ml engineer",
    "bi developer",
    "business intelligence",
    "analytique",
    "big data",
    "pipeline de données",
    "ingénieur données",
    "analyste données",
]

# Construire le pattern regex (insensible à la casse — title déjà en lowercase)
pattern = "|".join(DATA_KEYWORDS)

df_data = df[df["title"].str.contains(pattern, case=False, na=False)].copy()

print(f"Offres Data filtrées : {len(df_data)} / {len(df)} ✅")

# 💾 4. Sauvegarde Parquet → Silver
parquet_buffer = BytesIO()
df_data.to_parquet(parquet_buffer, index=False, engine="pyarrow")
parquet_buffer.seek(0)

# 📤 5. Envoyer vers Silver
client.put_object(
    "silver",
    "jobs_data_cleaned.parquet",
    data=parquet_buffer,
    length=parquet_buffer.getbuffer().nbytes,
    content_type="application/octet-stream"
)

print("Données Data envoyées vers Silver ✅")
# Nombre d'offres avant/après
print(f"Total offres     : {len(df)}")
print(f"Offres Data      : {len(df_data)}")
print(f"Offres exclues   : {len(df) - len(df_data)}")

# Voir les titres filtrés
print("\n📋 Titres retenus :")
print(df_data["title"].value_counts().head(20))

# Voir les titres NON retenus (pour vérifier qu'on n'a rien manqué)
df_excluded = df[~df.index.isin(df_data.index)]
print("\n🚫 Titres exclus (échantillon) :")
print(df_excluded["title"].value_counts().head(20))