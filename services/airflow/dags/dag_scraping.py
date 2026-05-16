from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta

default_args = {'owner': 'airflow', 'start_date': datetime(2024, 1, 1)}

with DAG('dag_scraping_maroc', schedule_interval='0 */6 * * *', default_args=default_args, catchup=False) as dag:
    
    # Airflow needs to be in the project root to find 'scrapy.cfg'
    # 'cd /opt/airflow/app &&' is crucial to run scrapy properly
    scrape_rekrute = BashOperator(
        task_id='scrape_rekrute',
        bash_command='cd /opt/airflow/app && scrapy crawl rekrute'
    )

    scrape_emploi = BashOperator(
        task_id='scrape_emploi',
        bash_command='cd /opt/airflow/app && scrapy crawl emploi_spider'
    )
    
    scrape_linkedin = BashOperator(
        task_id='scrape_linkedin',
        bash_command='cd /opt/airflow/app && scrapy crawl linkedin -s CLOSESPIDER_TIMEOUT=7200'
    )

    [scrape_rekrute, scrape_emploi, scrape_linkedin]