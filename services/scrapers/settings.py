USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"

BOT_NAME = 'job_scrapers'
SPIDER_MODULES = ['services.scrapers.morocco', 'services.scrapers.international']
NEWSPIDER_MODULE = 'services.scrapers.morocco'


ITEM_PIPELINES = {
   'services.scrapers.pipeline.LocalFilePipeline': 300,
   # 'services.scrapers.minioPipeline.MinioBronzePipeline': 300
}

CONCURRENT_REQUESTS = 1
DOWNLOAD_DELAY = 3
ROBOTSTXT_OBEY = False # LinkedIn requires this to be false for Selenium to work


# Make sure the data is saved
FEEDS = {
    'jobs.json': {
        'format': 'json',
        'encoding': 'utf8',
        'store_empty': False,
        'indent': 4,
    }
}


# ITEM_PIPELINES = {
#     "myspider.pipelines.SilverLayerPipeline": 300
#     }
SILVER_OUTPUT  = "silver/linkedin/offres.json"