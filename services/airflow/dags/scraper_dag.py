from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.bash import BashOperator

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'job_scrapers_dag',
    default_args=default_args,
    description='A simple DAG to run job scrapers periodically',
    schedule_interval=timedelta(days=1),
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['scraping', 'jobs'],
) as dag:

    # Example: Run Emploi Spider
    run_emploi_spider = BashOperator(
        task_id='run_emploi_spider',
        bash_command='cd /opt/airflow/services/scrapers && scrapy crawl emploi_spider',
    )

    # Example: Run Rekrute Spider
    run_rekrute_spider = BashOperator(
        task_id='run_rekrute_spider',
        bash_command='cd /opt/airflow/services/scrapers && scrapy crawl rekrute_spider',
    )

    # Example: Run LinkedIn Spider
    run_linkedin_spider = BashOperator(
        task_id='run_linkedin_spider',
        bash_command='cd /opt/airflow/services/scrapers && scrapy crawl linkedin_spider',
    )

    # Set dependencies (they can run in parallel)
    [run_emploi_spider, run_rekrute_spider, run_linkedin_spider]
