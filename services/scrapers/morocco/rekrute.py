import scrapy
import re
from services.scrapers.items import JobItem

class RekruteSpider(scrapy.Spider):
    name = "rekrute"
    source_name = "rekrute"
    BASE_URL = "https://www.rekrute.com"
    
    # Configuration
    MAX_PAGES = 3 

    def start_requests(self):
        # Start scraping at page 1
        yield scrapy.Request(
            f"{self.BASE_URL}/offres.html?p=1&s=1&o=1", 
            callback=self.parse, 
            meta={'page': 1}
        )

    def extract_region(self, title_raw):
        # 1️⃣ méthode simple "|"
        if "|" in title_raw:
            parts = title_raw.split("|")
            return parts[1].strip()

        # 2️⃣ regex fallback
        match = re.search(r"(Casablanca|Rabat|Tanger|Marrakech|Fès|Agadir)", title_raw)
        if match:
            return match.group(1)
        return ""

    def parse(self, response):
        # CSS Selectors for Rekrute
        listings = response.css("ul.job-list2 li.post-id")

        for li in listings:
            title_tag = li.css("h2 a.titreJob::text").get()
            title = title_tag.strip() if title_tag else ""
            
            img = li.css("img.photo::attr(alt)").get()
            company = img.strip() if img else "Confidentiel"
            
            href = li.css("h2 a.titreJob::attr(href)").get()
            url = self.BASE_URL + href if href else ""

            # Mapping to JobItem
            item = JobItem()
            item["title"] = title
            item["company"] = company
            item["region"] = self.extract_region(title)
            item["url"] = url
            # Fields that are empty/not in the list view
            item["published_time"] = None
            item["description"] = None 
            item["category"] = None
            item["remote"] = None
            item["experience"] = None
            item["education"] = None
            item["contract"] = None
            item["company_name_full"] = company
            item["company_sector"] = None
            item["company_website"] = None
            item["company_description"] = None

            yield item

        # Pagination Logic: Keep scraping until MAX_PAGES
        current_page = response.meta.get('page')
        if current_page < self.MAX_PAGES:
            next_page = current_page + 1
            next_url = f"{self.BASE_URL}/offres.html?p={next_page}&s=1&o=1"
            yield scrapy.Request(next_url, callback=self.parse, meta={'page': next_page})