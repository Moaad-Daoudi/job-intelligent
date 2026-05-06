## Project Structure

```text
job-intelligent/
├── docker/
│   ├── docker-compose.yml
│   └── data/
│       ├── minio/
│       └── postgres/
├── services/
│   ├── airflow/
│   │   └── dags/
│   │       └── scraper_dag.py
│   ├── dbt/
│   ├── etl/
│   └── scrapers/
│       ├── items.py
│       ├── pipeline.py
│       ├── minioPipeline.py
│       ├── settings.py
│       ├── run_all.py
│       ├── count_jobs.py
│       ├── format_jobs.py
│       ├── international/
│       │   ├── apec.py
│       │   ├── france_travail.py
│           ├── linkedin.py
│       │   └── glassdoor.py
│       └── morocco/
│           ├── emploi.py
│           └── rekrute.py
├── scrapy.cfg
└── Readme.md
```
