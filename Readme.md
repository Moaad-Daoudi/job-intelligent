## Scapy

### Scrapy execution flow

```
start_urls
   ↓
parse()
   ↓
extract data
   ↓
follow links
   ↓
parse_detail()
   ↓
yield items
   ↓
output (JSON / DB)
```

### FULL REAL SCRAPY SPIDER (ALL METHODS TOGETHER)

```python
import scrapy


class JobsSpider(scrapy.Spider):
    name = "jobs"
    allowed_domains = ["example.com"]
    start_urls = ["https://example.com/jobs"]

    def parse(self, response):
        jobs = response.css("div.job-card")

        for job in jobs:
            title = job.css("h2::text").get()
            url = job.css("a::attr(href)").get()

            yield scrapy.Request(
                url=response.urljoin(url),
                callback=self.parse_detail,
                meta={"title": title}
            )

        # pagination
        next_page = response.css("a.next::attr(href)").get()
        if next_page:
            yield response.follow(next_page, self.parse)

    def parse_detail(self, response):
        yield {
            "title": response.meta["title"],
            "description": response.css(".description::text").get(),
        }

    def closed(self, reason):
        print("Finished:", reason)
```