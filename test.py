from minio import Minio
import pandas as pd
from io import BytesIO

client = Minio(
    "localhost:9001",
    access_key="minioadmin",
    secret_key="miniopassword",
    secure=False
)

# 📥 récupérer le fichier Parquet
response = client.get_object("silver", "jobs_cleaned.parquet")

# 🔄 lire en DataFrame
df = pd.read_parquet(BytesIO(response.read()))

response.close()
response.release_conn()

print(df.head(10).to_string())  # voir les premières lignes