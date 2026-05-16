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



```bash
docker compose run --rm airflow-webserver db init
```
It creates all required tables inside PostgreSQL for Airflow:
- DAG table
- task instances
- logs
- connections
- users (if needed)
- scheduling metadata


```bash
docker compose run --rm airflow-webserver users create --username admin --firstname Admin --lastname Admin --role Admin --email admin@example.com --password admin
```


**Run the db_airflow :**

```bash
docker compose up -d airflow-db
```


**Run the Init container :**
```bash
docker compose run airflow-init
```

**update container :**

```bash
docker compose --env-file .env -f docker/docker-compose.yml up -d
```

**Check container :**

```bash
docker compose --env-file .env -f docker/docker-compose.yml config
```
