<<<<<<< HEAD
# from minio import Minio
# import pandas as pd
# from io import BytesIO

# client = Minio(
#     "localhost:9001",
#     access_key="minioadmin",
#     secret_key="miniopassword",
#     secure=False
# )

# # 📥 récupérer le fichier Parquet
# response = client.get_object("silver", "jobs_cleaned.parquet")

# # 🔄 lire en DataFrame
# df = pd.read_parquet(BytesIO(response.read()))

# response.close()
# response.release_conn()

# print(df.head(10).to_string())  # voir les premières lignes

# from minio import Minio
# import os

# client = Minio('localhost:9001', access_key='minioadmin', secret_key='miniopassword', secure=False)

# bronze_dir = 'bronze'
# for source in os.listdir(bronze_dir):
#     source_path = os.path.join(bronze_dir, source)
#     for root, dirs, files in os.walk(source_path):
#         for file in files:
#             local_path = os.path.join(root, file)
#             minio_key = local_path.replace(bronze_dir + os.sep, '').replace(os.sep, '/')
#             client.fput_object('bronze', minio_key, local_path)
#             print(f'Uploaded: {minio_key}')
# print('Done!')


# from minio import Minio
# client = Minio('localhost:9001', access_key='minioadmin', secret_key='miniopassword', secure=False)
# objects = client.list_objects('bronze', recursive=True)
# for obj in objects:
#     print(f'{obj.object_name} — {obj.size} bytes')

# from minio import Minio
# client = Minio('localhost:9001', access_key='minioadmin', secret_key='miniopassword', secure=False)
# objects = client.list_objects('silver', recursive=True)
# for obj in objects:
#     print(f'{obj.object_name} — {obj.size} bytes')


# from minio import Minio
# import pandas as pd
# from io import BytesIO
# client = Minio('localhost:9001', access_key='minioadmin', secret_key='miniopassword', secure=False)
# objects = list(client.list_objects('silver', recursive=True))
# latest = sorted(objects, key=lambda x: x.last_modified, reverse=True)[0]
# print(f'Fichier : {latest.object_name}')
# resp = client.get_object('silver', latest.object_name)
# df = pd.read_parquet(BytesIO(resp.read()))
# print(f'Shape : {df.shape}')
# print(df[['title','company','region','source']].head(10))

import psycopg2; conn = psycopg2.connect(host='localhost', port=5432, dbname='mydatabase', user='user', password='password'); print('✅ PostgreSQL OK !'); conn.close()
=======
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
>>>>>>> 6eaea1619630be4faa8474c1aa45b9dffdfeb927
