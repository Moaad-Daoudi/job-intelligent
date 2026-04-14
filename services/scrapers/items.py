import scrapy

class JobItem(scrapy.Item):
    title = scrapy.Field()
    company = scrapy.Field()
    published_time = scrapy.Field()
    description = scrapy.Field()
    category = scrapy.Field()
    region = scrapy.Field()
    remote = scrapy.Field()
    experience = scrapy.Field()
    education = scrapy.Field()
    contract = scrapy.Field()
    company_name_full = scrapy.Field()
    company_sector = scrapy.Field()
    company_website = scrapy.Field()
    company_description = scrapy.Field()
    url = scrapy.Field()