import boto3
import json
import os
from dotenv import load_dotenv

load_dotenv()

def count_jobs_in_minio(bucket, key):
    s3 = boto3.client(
        's3',
        endpoint_url=os.getenv('MINIO_ENDPOINT'),
        aws_access_key_id=os.getenv('MINIO_ROOT_USER'),
        aws_secret_access_key=os.getenv('MINIO_ROOT_PASSWORD')
    )
    obj = s3.get_object(Bucket=bucket, Key=key)
    lines = obj['Body'].read().decode('utf-8').splitlines()
    return len(lines)

# Count your jobs
print(f"Jobs in Emploi.ma: {count_jobs_in_minio('bronze', 'emploi_ma/2026/04/29/offres.json')}")
print(f"Jobs in LinkedIn: {count_jobs_in_minio('bronze', 'linkedin/2026/04/29/offres.json')}")