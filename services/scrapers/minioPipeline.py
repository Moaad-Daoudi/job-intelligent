import boto3
import json
import os
import logging
from datetime import datetime
from io import BytesIO

logger = logging.getLogger(__name__)

class MinioBronzePipeline:
    def __init__(self, endpoint, access_key, secret_key, bucket_name):
        if not endpoint.startswith('http'):
            endpoint = 'http://' + endpoint
            
        logger.info(f"MinIO Pipeline connecting to: {endpoint}")
        
        self.s3 = boto3.client(
            's3',
            endpoint_url=endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name='us-east-1'
        )
        self.bucket_name = bucket_name

    @classmethod
    def from_crawler(cls, crawler):
        endpoint = os.getenv('MINIO_ENDPOINT', 'http://minio:9000')
        return cls(
            endpoint=endpoint,
            access_key=os.getenv('MINIO_ROOT_USER', 'minioadmin'),
            secret_key=os.getenv('MINIO_ROOT_PASSWORD', 'miniopassword'),
            bucket_name=os.getenv('MINIO_BUCKET_BRONZE', 'bronze')
        )

    def process_item(self, item, spider):
        source_name = getattr(spider, "source_name", spider.name)
        now = datetime.now()
        
        # Path: bronze/source/YYYY/MM/DD/offres.json
        s3_key = f"{source_name}/{now.strftime('%Y')}/{now.strftime('%m')}/{now.strftime('%d')}/offres.json"
        
        # 1. Try to get existing content
        try:
            obj = self.s3.get_object(Bucket=self.bucket_name, Key=s3_key)
            existing_data = obj['Body'].read().decode('utf-8')
        except self.s3.exceptions.NoSuchKey:
            existing_data = ""
        except Exception as e:
            logger.error(f"Error accessing MinIO: {e}")
            existing_data = ""

        # 2. Append new item
        new_line = json.dumps(dict(item), ensure_ascii=False) + "\n"
        updated_data = existing_data + new_line

        # 3. Upload back to MinIO
        self.s3.put_object(
            Bucket=self.bucket_name,
            Key=s3_key,
            Body=updated_data.encode('utf-8')
        )
            
        return item