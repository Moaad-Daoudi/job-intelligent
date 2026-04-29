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

        # 🔥 support JSON array OU JSONL
        try:
            data = json.loads(content)  # JSON array
        except:
            data = [json.loads(line) for line in content.splitlines() if line.strip()]  # JSONL

        # ajouter source
        for d in data:
            d["source"] = source

        all_data.extend(data)
        print(f"{source} chargé ✅ ({len(data)} offres)")

    except Exception as e:
        print(f"Erreur avec {source} ❌ :", e)

# convertir en DataFrame
df = pd.DataFrame(all_data)

print("Avant nettoyage :", df.shape)

# 🔥 2. CLEANING

df = df[df["title"].notna() & (df["title"] != "")]

df["title"] = df["title"].str.strip().str.lower()
df["company"] = df["company"].str.strip().str.lower()
df["region"] = df["region"].str.strip()

df.fillna("Non spécifié", inplace=True)

df.drop_duplicates(subset=["title", "company", "source"], inplace=True)

print("Après nettoyage :", df.shape)

# 💾 3. Sauvegarde CSV
csv_buffer = BytesIO()
df.to_csv(csv_buffer, index=False)
csv_buffer.seek(0)

# 📤 4. Upload Silver
client.put_object(
    "silver",
    "jobs_cleaned.csv",
    data=csv_buffer,
    length=csv_buffer.getbuffer().nbytes,
    content_type="text/csv"
)

print("Données envoyées vers Silver ✅")