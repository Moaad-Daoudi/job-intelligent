from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'airflow', 
    'retries': 3,                 
    'retry_delay': timedelta(minutes=10),
    'start_date': datetime(2024, 1, 1)
    }

with DAG('dag_processing_data', schedule_interval='0 4 * * *', default_args=default_args, catchup=False) as dag:

    # Run cleaning (Bronze -> Silver)
    clean_data = BashOperator(
        task_id='minio_cleaning',
        bash_command='python3 /opt/airflow/app/processing/minio_cleaning.py'
    )

    # Run loading (Silver -> Postgres)
    load_postgres = BashOperator(
        task_id='gold_to_postgres',
        bash_command='python3 /opt/airflow/app/processing/gold_to_postgres.py'
    )

    clean_data >> load_postgres