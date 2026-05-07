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

# import psycopg2; conn = psycopg2.connect(host='localhost', port=5432, dbname='mydatabase', user='user', password='password'); print('✅ PostgreSQL OK !'); conn.close()



# 

# from minio import Minio
# import os
# client = Minio('localhost:9001', access_key='minioadmin', secret_key='miniopassword', secure=False)
# bronze_dir = 'bronze'
# for source in os.listdir(bronze_dir):
#     for root, dirs, files in os.walk(os.path.join(bronze_dir, source)):
#         for file in files:
#             local_path = os.path.join(root, file)
#             minio_key = local_path.replace(bronze_dir + os.sep, '').replace(os.sep, '/')
#             client.fput_object('bronze', minio_key, local_path)
#             print(f'Uploaded: {minio_key}')
# print('Done!')


import psycopg2
conn = psycopg2.connect(host='localhost', port=5432, dbname='mydatabase', user='user', password='password')
cursor = conn.cursor()
cursor.execute('CREATE OR REPLACE VIEW view_top_roles AS SELECT title, COUNT(*) as nb_offres, source FROM gold_offers GROUP BY title, source ORDER BY nb_offres DESC;')
cursor.execute('CREATE OR REPLACE VIEW view_offres_par_region AS SELECT location, COUNT(*) as nb_offres FROM gold_offers WHERE location IS NOT NULL GROUP BY location ORDER BY nb_offres DESC;')
cursor.execute('CREATE OR REPLACE VIEW view_offres_par_source AS SELECT source, COUNT(*) as nb_offres FROM gold_offers GROUP BY source ORDER BY nb_offres DESC;')
cursor.execute('CREATE OR REPLACE VIEW view_offres_par_contrat AS SELECT COALESCE(contract, cast(chr(78) as text)) as contract, COUNT(*) as nb_offres FROM gold_offers GROUP BY contract ORDER BY nb_offres DESC;')
conn.commit()
cursor.close()
conn.close()
print('Vues creees!')

