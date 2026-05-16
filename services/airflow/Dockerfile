FROM apache/airflow:2.9.0
USER root

# Install system dependencies for Chromium/Selenium
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    chromium-driver \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxrandr2 \
    libxdamage1 \
    libgbm-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

USER airflow

# Install Python packages
RUN pip install --no-cache-dir \
    pandas \
    minio \
    psycopg2-binary \
    scrapy \
    selenium \
    beautifulsoup4 \
    sqlalchemy \
    pyarrow \
    fastparquet \
    dbt-postgres