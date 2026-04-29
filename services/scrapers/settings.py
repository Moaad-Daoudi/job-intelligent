USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"

BOT_NAME = 'job_scrapers'
SPIDER_MODULES = ['services.scrapers.morocco', 'services.scrapers.international']
NEWSPIDER_MODULE = 'services.scrapers.morocco'


ITEM_PIPELINES = {
   # 'services.scrapers.pipeline.LocalFilePipeline': 300,
   'services.scrapers.minioPipeline.MinioBronzePipeline': 300
}