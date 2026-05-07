"""
gold_to_postgres.py  —  Silver (MinIO) → PostgreSQL Gold
=========================================================
Lit le dernier fichier Parquet depuis MinIO Silver,
crée la table si elle n'existe pas,
et insère les offres Data dans PostgreSQL.

USAGE :
    python processing/gold_to_postgres.py
"""

from minio import Minio
from minio.error import S3Error
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from io import BytesIO
from datetime import datetime

# ══════════════════════════════════════════════════════════════════════════════
# 🔌 CONNEXION MINIO
# ══════════════════════════════════════════════════════════════════════════════
minio_client = Minio(
    "localhost:9001",
    access_key="minioadmin",
    secret_key="miniopassword",
    secure=False
)

# ══════════════════════════════════════════════════════════════════════════════
# 🔌 CONNEXION POSTGRESQL
# ══════════════════════════════════════════════════════════════════════════════
PG_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "dbname":   "mydatabase",
    "user":     "user",
    "password": "password"
}

BUCKET_SILVER = "silver"

# ══════════════════════════════════════════════════════════════════════════════
# 📥 1. LIRE LE DERNIER PARQUET DEPUIS MINIO SILVER
# ══════════════════════════════════════════════════════════════════════════════
print("📥 Lecture du Silver depuis MinIO...")

try:
    objects = list(minio_client.list_objects(BUCKET_SILVER, recursive=True))
    if not objects:
        print("❌ Aucun fichier dans Silver. Lance d'abord minio_cleaning.py")
        exit(1)

    # Prendre le fichier le plus récent
    latest = sorted(objects, key=lambda x: x.last_modified, reverse=True)[0]
    print(f"  📄 Fichier : {latest.object_name}")

    resp = minio_client.get_object(BUCKET_SILVER, latest.object_name)
    df   = pd.read_parquet(BytesIO(resp.read()))
    resp.close()
    resp.release_conn()

    print(f"  ✅ {len(df)} offres chargées — {df.shape[1]} colonnes")

except S3Error as e:
    print(f"❌ Erreur MinIO : {e}")
    exit(1)

# ══════════════════════════════════════════════════════════════════════════════
# 🧹 2. PRÉPARER LES DONNÉES POUR POSTGRESQL
# ══════════════════════════════════════════════════════════════════════════════
print("\n🧹 Préparation des données...")

# Colonnes qu'on va insérer dans PostgreSQL
# On garde les colonnes essentielles disponibles dans le Silver
COLUMNS_TO_KEEP = ["title", "company", "region", "contract", 
                   "description", "url", "source", "published_time",
                   "experience", "education"]

# Garder seulement les colonnes qui existent dans le DataFrame
cols_available = [c for c in COLUMNS_TO_KEEP if c in df.columns]
df_gold = df[cols_available].copy()

# Remplacer les valeurs None/NaN par None Python (pour PostgreSQL NULL)
df_gold = df_gold.where(pd.notna(df_gold), None)
# Supprimer les doublons basés sur l'URL
before = len(df_gold)

df_gold = df_gold.drop_duplicates(
    subset=["url"],
    keep="last"
)

after = len(df_gold)

print(f"  🔁 Doublons supprimés : {before - after}")
# Renommer 'region' en 'location' pour correspondre au schéma Gold
if "region" in df_gold.columns:
    df_gold = df_gold.rename(columns={"region": "location"})

print(f"  ✅ Colonnes préparées : {list(df_gold.columns)}")
print(f"  ✅ Offres à insérer   : {len(df_gold)}")

# ══════════════════════════════════════════════════════════════════════════════
# 🗄️  3. CRÉER LA TABLE DANS POSTGRESQL
# ══════════════════════════════════════════════════════════════════════════════
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS gold_offers (
    id              SERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    company         TEXT,
    location        TEXT,
    contract        TEXT,
    description     TEXT,
    url             TEXT UNIQUE,
    source          TEXT,
    published_time  TEXT,
    experience      TEXT,
    education       TEXT,
    inserted_at     TIMESTAMP DEFAULT NOW()
);
"""

# Index pour accélérer les recherches
CREATE_INDEXES_SQL = [
    "CREATE INDEX IF NOT EXISTS idx_gold_offers_title    ON gold_offers (title);",
    "CREATE INDEX IF NOT EXISTS idx_gold_offers_source   ON gold_offers (source);",
    "CREATE INDEX IF NOT EXISTS idx_gold_offers_location ON gold_offers (location);",
]

print("\n🗄️  Connexion à PostgreSQL...")
try:
    conn   = psycopg2.connect(**PG_CONFIG)
    cursor = conn.cursor()

    # Créer la table
    cursor.execute(CREATE_TABLE_SQL)
    for idx_sql in CREATE_INDEXES_SQL:
        cursor.execute(idx_sql)
    conn.commit()
    print("  ✅ Table 'gold_offers' prête.")

except Exception as e:
    print(f"❌ Erreur PostgreSQL : {e}")
    exit(1)

# ══════════════════════════════════════════════════════════════════════════════
# 📤 4. INSÉRER LES DONNÉES
# ══════════════════════════════════════════════════════════════════════════════
print("\n📤 Insertion des offres dans PostgreSQL...")

# Colonnes dans l'ordre d'insertion
insert_cols = list(df_gold.columns)
insert_sql  = f"""
    INSERT INTO gold_offers ({', '.join(insert_cols)})
    VALUES %s
    ON CONFLICT (url) DO UPDATE SET
        title          = EXCLUDED.title,
        company        = EXCLUDED.company,
        location       = EXCLUDED.location,
        contract       = EXCLUDED.contract,
        description    = EXCLUDED.description,
        source         = EXCLUDED.source,
        published_time = EXCLUDED.published_time,
        inserted_at    = NOW();
"""

# Convertir le DataFrame en liste de tuples
rows = [tuple(row) for row in df_gold.itertuples(index=False, name=None)]

try:
    execute_values(cursor, insert_sql, rows)
    conn.commit()
    print(f"  ✅ {len(rows)} offres insérées / mises à jour dans 'gold_offers'")

except Exception as e:
    conn.rollback()
    print(f"❌ Erreur insertion : {e}")
    cursor.close()
    conn.close()
    exit(1)

# ══════════════════════════════════════════════════════════════════════════════
# 📊 5. VÉRIFICATION FINALE
# ══════════════════════════════════════════════════════════════════════════════
print("\n📊 Vérification dans PostgreSQL...")

cursor.execute("SELECT COUNT(*) FROM gold_offers;")
total = cursor.fetchone()[0]
print(f"  ✅ Total offres dans gold_offers : {total}")

cursor.execute("""
    SELECT source, COUNT(*) as nb
    FROM gold_offers
    GROUP BY source
    ORDER BY nb DESC;
""")
print("\n  📌 Répartition par source :")
for row in cursor.fetchall():
    print(f"     {row[0]:<15} → {row[1]} offres")

cursor.execute("""
    SELECT location, COUNT(*) as nb
    FROM gold_offers
    GROUP BY location
    ORDER BY nb DESC
    LIMIT 5;
""")
print("\n  📌 Top 5 régions :")
for row in cursor.fetchall():
    print(f"     {str(row[0])[:40]:<40} → {row[1]} offres")

cursor.execute("""
    SELECT title, company, location, source
    FROM gold_offers
    LIMIT 5;
""")
print("\n  📌 Aperçu des 5 premières offres :")
for row in cursor.fetchall():
    print(f"     [{row[3]}] {row[0][:40]} | {row[1][:20]} | {str(row[2])[:25]}")

cursor.close()
conn.close()

print("\n" + "="*55)
print("✅ PIPELINE COMPLET : Silver → PostgreSQL terminé !")
print("="*55)
print(f"   Table     : gold_offers")
print(f"   Offres    : {total}")
print(f"   Prochaine étape : FastAPI lit cette table")