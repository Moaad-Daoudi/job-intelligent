import scrapy
from services.scrapers.items import JobItem

class EmploiSpider(scrapy.Spider):
    name = "emploi_spider"
    source_name = "emploi_ma"
    start_urls = [
        "https://www.emploi.ma/recherche-jobs-maroc"
    ]
    
    TARGET_KEYWORDS = [
        # --- Data & AI Roles (Specific) ---
        "data engineer", "data scientist", "data analyst", "ai engineer", 
        "machine learning", "business intelligence", "data architect", 
        "big data", "dataops", "mlops", "data modeler",
        
        # --- French Data Terms (Specific) ---
        "ingénieur data", "ingénieur données", "ingénieur big data", 
        "data engineer senior", "analyste data", "analyste de données",
        "ingénieur ia", "ingénieur intelligence artificielle",
        "stage data", "stage ia", "pfe data", "alternance data", "stagiaire data"
    ]
    
    def start_requests(self):
        """
        Forces Scrapy to start on every URL in start_urls, 
        even if they seem similar.
        """
        for url in self.start_urls:
            self.logger.info(f"Starting crawl at: {url}")
            yield scrapy.Request(url, callback=self.parse, dont_filter=True)
            
    def is_data_job(self, title):        
        title_lower = title.lower()
        # Returns True if any keyword matches
        return any(keyword in title_lower for keyword in self.TARGET_KEYWORDS)
    
    # List Page
    def parse(self, response):
        jobs = response.css("div.card-job")
        for job in jobs:
            job_title = job.css("h3 a::text").get(default="").strip()
            if self.is_data_job(job_title):
                company_name = job.css("a.company-name::text").get(default="").strip()
                published_time = job.css("time::text").get(default="").strip()
                
                link = job.attrib.get("data-href")
                if link:
                    yield response.follow(link, 
                                          callback = self.parse_job,
                                          meta = {
                                              "job_title": job_title,
                                              "company_name": company_name,
                                              "published_time": published_time
                                          })
            else:
                self.logger.info(f"Skipping non-data job: {job_title}")
                
        next_page = response.css("a[title*='page suivante']::attr(href)").get()
        if next_page:
            yield response.follow(next_page, self.parse)
          
    # Detail Page  
    def parse_job(self, response):
        try:
            item = JobItem()
            
            item["title"] = response.meta.get("job_title", "")
            item["company"] = response.meta.get("company_name", "")
            item["published_time"] = response.meta.get("published_time", "")
            item["description"] = " ".join(
                t.strip() for t in response.css(".job-description *::text").getall() if t.strip()
            )

            category = ""
            region = ""
            remote = ""
            experience = ""
            education = ""
            contract = ""

            for li in response.css("ul li"):
                classes = li.attrib.get("class", "")
                text = " ".join(li.css("::text").getall()).strip()

                if "suitcase" in classes:
                    category = text
                elif "location-dot" in classes:
                    region = text
                elif "filter-slider" in classes:
                    remote = text
                elif "chart" in classes:
                    experience = text
                elif "graduation-cap" in classes:
                    education = text
                elif "file-signature" in classes:
                    contract = text

            item["category"] = category
            item["region"] = region
            item["remote"] = remote
            item["experience"] = experience
            item["education"] = education
            item["contract"] = contract

            item["company_name_full"] = response.css(
                ".card-block-company h3 a::text"
            ).get(default="").strip()

            item["company_sector"] = response.css(
                ".field-name-field-entreprise-secteur .field-item::text"
            ).get(default="").strip()

            item["company_website"] = response.css(
                ".card-block-company a[href^='http']::attr(href)"
            ).get(default="").strip()

            item["company_description"] = " ".join(
                t.strip()
                for t in response.css(".company-description *::text").getall()
                if t.strip()
            )

            item["url"] = response.url

            yield item
            
        except Exception as e:
            self.logger.error(f"Erreur lors du parsing de {response.url}: {str(e)}")