import time
from datetime import datetime, timedelta
import urllib.parse
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import scrapy
from services.scrapers.items import JobItem
class LinkedInSpider(scrapy.Spider):
    name = "linkedin"
    EMAIL = "mouaddawdi496@gmail.com"
    PASSWORD = "0643537308"

    DATA_KEYWORDS = [
        # Data Engineering
        "data engineer", "data pipeline", "data platform", "data infrastructure",
        "etl", "elt", "data warehouse", "data lake", "data lakehouse",
        "data mesh", "dataops", "data integration",
        "spark", "kafka", "airflow", "dbt", "hadoop", "hive", "flink",
        "databricks", "snowflake", "bigquery", "redshift",
        # Analytics & BI
        "data analyst", "business analyst", "business intelligence",
        "bi developer", "bi engineer", "reporting analyst",
        "data visualization", "tableau", "power bi", "looker", "metabase", "qlik",
        # Data Science
        "data scientist", "data science", "data modeler",
        "statistician", "quantitative analyst", "predictive modeling",
        "forecasting", "a/b testing", "statistical analysis",
        # ML & AI
        "machine learning", "ml engineer", "ai engineer",
        "deep learning", "neural network", "nlp", "natural language processing",
        "computer vision", "reinforcement learning", "generative ai",
        "large language model", "llm", "prompt engineer", "rag",
        "ai researcher", "research scientist", "applied scientist",
        "mlops", "model deployment", "feature engineering",
        # Governance & Architecture
        "data architect", "data governance", "data quality",
        "data steward", "data catalog", "master data management", "mdm",
        # Tools & Cloud
        "python", "sql", "scala", "pyspark",
        "aws", "azure", "gcp", "cloud data", "kubernetes", "docker", "terraform",
        # French — Engineering
        "ingénieur data", "ingénieur données", "ingénieur big data",
        "développeur big data", "data engineer confirmé", "data engineer senior",
        "stockage", "base de données",
        # French — Analytics & BI
        "analyste data", "analyste de données", "informatique décisionnelle",
        "développeur bi", "consultant bi",
        # French — AI & Science
        "ingénieur ia", "ingénieur intelligence artificielle",
        "consultant ia", "data scientist senior",
        # French — Internships
        "stage data", "stage ia", "stage big data", "pfe data",
        "alternance data", "alternance ia", "stagiaire data", "stagiaire ia",
        # English — Internships
        "data intern", "analytics intern", "ml intern", "ai intern",
        "junior data", "entry level data",
    ]

    SEARCH_KEYWORDS = [

        # ── Data Profiles (English) ───────────────────────────────────────────────
        "data engineer Morocco",
        "data analyst Morocco",
        "data scientist Morocco",
        "data architect Morocco",
        "analytics engineer Morocco",
        "BI developer Morocco",
        "ETL developer Morocco",

        # ── AI / ML Profiles (English) ────────────────────────────────────────────
        "machine learning engineer Morocco",
        "MLOps engineer Morocco",
        "NLP engineer Morocco",
        "LLM engineer Morocco",
        "deep learning engineer Morocco",
        "AI engineer Morocco",
        "generative AI Morocco",
        "RAG engineer Morocco",
        "computer vision engineer Morocco",

        # ── Data Profiles (French) ────────────────────────────────────────────────
        "ingénieur data Maroc",
        "analyste data Maroc",
        "data scientist Maroc",
        "ingénieur big data Maroc",
        "développeur BI Maroc",
        "architecte data Maroc",
        "consultant data Maroc",

        # ── AI / ML Profiles (French) ─────────────────────────────────────────────
        "ingénieur IA Maroc",
        "ingénieur machine learning Maroc",
        "ingénieur NLP Maroc",
        "MLOps Maroc",
        "deep learning Maroc",
        "LLM Maroc",
        "IA générative Maroc",

        # ── Internships (French — most common in Morocco) ─────────────────────────
        "stage data Maroc",
        "stage IA Maroc",
        "stage big data Maroc",
        "alternance data Maroc",
        "alternance IA Maroc",
        "PFE data Maroc",
        "PFE intelligence artificielle Maroc",
        "stagiaire data Maroc",
        "stagiaire IA Maroc",

        # ── Internships (English) ────────────────────────────────────────────────
        "data intern Morocco",
        "machine learning intern Morocco",
        "AI intern Morocco",

        # ── Tools (high hiring signal in Morocco) ────────────────────────────────
        "Power BI Maroc",
        "Databricks Maroc",
        "Snowflake Maroc",
        "Python data Maroc",
        "SQL data Maroc",
    ]

    start_urls = [
    ] + [f"https://www.linkedin.com/jobs/search/?keywords={urllib.parse.quote(k)}&location=Morocco" for k in SEARCH_KEYWORDS] + [
        
        "https://www.linkedin.com/company/stages-portal/posts/",
        "https://www.linkedin.com/company/stages-recrutement-au-maroc/posts/",
        "https://www.linkedin.com/company/le-stagiaire/posts/",
        "https://www.linkedin.com/company/rh-recrutement-ma/posts/",
        "https://www.linkedin.com/company/anapec/posts/",
        "https://www.linkedin.com/company/4recruteee/posts/",
        "https://www.linkedin.com/company/emploi-recrutement/posts/",
        "https://www.linkedin.com/company/employment-and-talent-recruitment/posts/",
        "https://www.linkedin.com/company/maroc-emploi/posts/",
        "https://www.linkedin.com/company/rekrute/posts/",
        "https://www.linkedin.com/company/emploi-ma/posts/",
        "https://www.linkedin.com/company/mjob-ma/posts/",
        "https://www.linkedin.com/company/jobs-in-morocco/posts/",
        "https://www.linkedin.com/company/casajob/posts/",
        "https://www.linkedin.com/company/hiredma/posts/",
        "https://www.linkedin.com/company/stagiaires-ma/posts/",

        # # ============================================================
        # # 🤖 DATA & AI SPECIFIC COMMUNITIES
        # # ============================================================
        "https://www.linkedin.com/company/morocco-ai/posts/",
        "https://www.linkedin.com/company/ai-morocco/posts/",
        "https://www.linkedin.com/company/data-science-maroc/posts/",
        "https://www.linkedin.com/company/moroccotech/posts/",
        "https://www.linkedin.com/company/africa-data-science/posts/",
        "https://www.linkedin.com/company/job-opportunities-africa/posts/",

        # # ============================================================
        # # 🏢 TOP TECH & DATA EMPLOYERS IN MOROCCO
        # # ============================================================
        # # Consulting & Big4
        "https://www.linkedin.com/company/capgemini/posts/",
        "https://www.linkedin.com/company/accenture/posts/",
        "https://www.linkedin.com/company/deloitte/posts/",
        "https://www.linkedin.com/company/pwc/posts/",
        "https://www.linkedin.com/company/kpmg/posts/",
        "https://www.linkedin.com/company/ernst-young/posts/",
        "https://www.linkedin.com/company/mckinsey/posts/",
        "https://www.linkedin.com/company/aubay/posts/",
        "https://www.linkedin.com/company/sqli/posts/",
        "https://www.linkedin.com/company/alten/posts/",
        "https://www.linkedin.com/company/cgi-inc/posts/",
        "https://www.linkedin.com/company/sopra-steria/posts/",
        "https://www.linkedin.com/company/atos/posts/",
        "https://www.linkedin.com/company/wavestone/posts/",
        "https://www.linkedin.com/company/onepoint/posts/",

        # # Telecom & Banking (big data hirers in Morocco)
        "https://www.linkedin.com/company/maroc-telecom/posts/",
        "https://www.linkedin.com/company/inwi/posts/",
        "https://www.linkedin.com/company/orange-maroc/posts/",
        "https://www.linkedin.com/company/attijariwafa-bank/posts/",
        "https://www.linkedin.com/company/banque-populaire/posts/",
        "https://www.linkedin.com/company/cih-bank/posts/",
        "https://www.linkedin.com/company/bmce-bank/posts/",
        "https://www.linkedin.com/company/societe-generale-maroc/posts/",
        "https://www.linkedin.com/company/wafasalaf/posts/",

        # # Tech companies with Morocco offices
        "https://www.linkedin.com/company/ibm/posts/",
        "https://www.linkedin.com/company/oracle/posts/",
        "https://www.linkedin.com/company/sap/posts/",
        "https://www.linkedin.com/company/microsoft/posts/",
        "https://www.linkedin.com/company/google/posts/",
        "https://www.linkedin.com/company/amazon/posts/",
        "https://www.linkedin.com/company/sii-group/posts/",
        "https://www.linkedin.com/company/intelcia/posts/",
        "https://www.linkedin.com/company/webhelp/posts/",
        "https://www.linkedin.com/company/contextor/posts/",
        "https://www.linkedin.com/company/valuequest/posts/",

        # # ============================================================
        # # 👥 LINKEDIN GROUPS (Morocco & Africa focused)
        # # ============================================================
        "https://www.linkedin.com/groups/3295246/",   # original
        "https://www.linkedin.com/groups/1811580/",   # Data Science Morocco
        "https://www.linkedin.com/groups/12248925/",  # AI & Machine Learning Morocco
        "https://www.linkedin.com/groups/4447613/",   # Emploi Maroc
        "https://www.linkedin.com/groups/6519713/",   # Recrutement Maroc
        "https://www.linkedin.com/groups/2071626/",   # Big Data & Analytics
        "https://www.linkedin.com/groups/3825397/",   # Africa Tech & Data
        "https://www.linkedin.com/groups/1860090/",   # Data Engineering
        "https://www.linkedin.com/groups/7009231/",   # ML & AI Jobs

        # # ============================================================
        # # 🎓 SCHOOLS & INCUBATORS (post internship/job offers)
        # # ============================================================
        "https://www.linkedin.com/company/universite-mohammed-vi-polytechnique/posts/",
        "https://www.linkedin.com/company/ensias/posts/",
        "https://www.linkedin.com/company/ecole-polytechnique-maroc/posts/",
        "https://www.linkedin.com/company/hec-maroc/posts/",
        "https://www.linkedin.com/company/emi-rabat/posts/",
        "https://www.linkedin.com/company/um6p-ventures/posts/",
        "https://www.linkedin.com/company/moroccotech-hub/posts/",
        "https://www.linkedin.com/company/technopark/posts/",
        "https://www.linkedin.com/company/startgate-maroc/posts/",
    ]

    def __init__(self, *args, **kwargs):
        super(LinkedInSpider, self).__init__(*args, **kwargs)
        chrome_options = Options()
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        self.driver = webdriver.Chrome(options=chrome_options)

    def start_requests(self):
        self.driver.get("https://www.linkedin.com/login")
        wait = WebDriverWait(self.driver, 15)
        
        # Check if we are already logged in
        time.sleep(2)
        if "feed" not in self.driver.current_url and "login" in self.driver.current_url:
            try:
                # Based on the screenshot "Bon retour parmi nous", the user's account is already 
                # displayed. Sometimes we have to click "S'identifier avec un autre compte" 
                # or just enter the password. Let's make sure we find the exact generic form.
                
                # Check for "Welcome Back" password field directly first.
                try:
                    password_field = self.driver.find_element(By.ID, "password")
                    if password_field.is_displayed():
                        try:
                            username_field = self.driver.find_element(By.ID, "username")
                            if username_field.is_displayed():
                                username_field.clear()
                                username_field.send_keys(self.EMAIL)
                        except:
                            pass # "username" field might not exist on "welcome back" screens
                    password_field.clear()
                    password_field.send_keys(self.PASSWORD)
                    self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
                    time.sleep(10)
                    self.logger.info("Successfully logged in via 'Welcome Back' screen.")
                    
                    # Start scraping sequentially
                    if self.start_urls:
                        url = self.start_urls[0]
                        yield scrapy.Request(url=url, callback=self.parse, meta={'index': 0, 'target_url': url}, dont_filter=True)
                    return # Exit the generator after yielding
                except:
                    pass

                try:
                    # Let the page fully load the dynamic inputs if they exist
                    time.sleep(2)
                    password_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
                    visible_passwords = [p for p in password_inputs if p.is_displayed()]
                    
                    if visible_passwords:
                        pass_elem = visible_passwords[0]
                        
                        email_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='text'], input[type='email']")
                        # Look specifically for inputs that are text/email and visible
                        visible_emails = [e for e in email_inputs if e.is_displayed()]
                        
                        if visible_emails:
                            # Try to pick the most likely email field instead of just [0] which might be a search bar
                            candidate = None
                            for e in visible_emails:
                                name_attr = e.get_attribute("name") or ""
                                id_attr = e.get_attribute("id") or ""
                                if "session" in name_attr or "username" in name_attr or "email" in name_attr or "session" in id_attr.lower() or "username" in id_attr.lower() or "email" in id_attr.lower():
                                    candidate = e
                                    break
                            
                            email_elem = candidate if candidate else visible_emails[0]
                            email_elem.clear()
                            email_elem.send_keys(self.EMAIL)
                            
                        pass_elem.clear()
                        pass_elem.send_keys(self.PASSWORD)
                        self.logger.info("Locating and typing credentials via generic CSS selectors.")
                        
                except Exception as e:
                    self.logger.error(f"Could not fill login fields: {e}")
                    with open("linkedin_error_page.html", "w", encoding="utf-8") as f:
                        f.write(self.driver.page_source)
                    self.logger.error("Saved page source to linkedin_error_page.html for debugging.")
                    
                # Using a broader click approach for LinkedIn login forms
                try:
                    btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']")))
                    btn.click()
                except:
                    try:
                        self.driver.execute_script("document.querySelector(\"button[type='submit']\").click();")
                    except:
                        pass
                    
            except Exception as e:
                self.logger.error(f"Login failed: {e}")
                pass
        
        self.logger.info("Waiting 30 seconds for any manual login actions if automation failed...")
        time.sleep(30)
        
        # Start scraping sequentially
        if getattr(self, "start_urls", []):
            url = self.start_urls[0]
            yield scrapy.Request(url=url, callback=self.parse, meta={'index': 0, 'target_url': url}, dont_filter=True)

    def expand_posts(self):
        """Click all 'See more' buttons."""
        buttons = self.driver.find_elements(By.CLASS_NAME, "inline-show-more-text__button")
        for btn in buttons:
            try:
                self.driver.execute_script("arguments[0].click();", btn)
            except:
                continue

    def is_data_job(self, text):
        """Returns True if the text contains keywords related to Data & AI roles."""
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in self.DATA_KEYWORDS)

    def parse_date(self, time_str):
        """Calculates date based on '2d', '3h', etc."""
        now = datetime.now()
        try:
            num = int(''.join(filter(str.isdigit, time_str)))
            if 'd' in time_str:
                dt = now - timedelta(days=num)
            elif 'h' in time_str or 'm' in time_str:
                dt = now
            elif 'w' in time_str:
                dt = now - timedelta(weeks=num)
            else:
                dt = now
            return dt.strftime("%d.%m.%Y")
        except:
            return now.strftime("%d.%m.%Y")

    def parse(self, response):
        target_url = response.meta.get('target_url') or response.url
        try:
            self.logger.info(f"Attempting to fetch {target_url}")
            
            # Route to correct parsing logic based on URL
            if "/jobs/search/" in target_url:
                self.logger.info(f"Starting Job Search: {target_url}")
                yield from self.parse_job_search(response, 0)
            else:
                self.logger.info(f"Starting Company Posts: {target_url}")
                self.driver.get(target_url)
                time.sleep(5)
                
                # Additional check to ensure we aren't on the "Welcome Back" page by error.
                if "login" in self.driver.current_url:
                    self.logger.warning(f"Got redirected to login on {target_url}. We might be blocked or logged out.")
                    # We won't attempt to log in again here to avoid infinite loops, 
                    # but we will just pass and go to the next url.
                else:
                    # Scroll & Expand
                    for _ in range(5):
                        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                        time.sleep(4)
                        self.expand_posts()
            
                    soup = BeautifulSoup(self.driver.page_source, 'html.parser')
                    posts = soup.select('.feed-shared-update-v2')
            
                    self.logger.info(f"==> NUMBER OF POSTS FOUND ON PAGE: {len(posts)}")
                    
                    for post in posts:
                        text_el = post.select_one('.update-components-update-v2__commentary span[dir="ltr"]')
                        actor_el = post.select_one('.update-components-actor__title')
                        time_el = post.select_one('.update-components-actor__sub-description')
                        
                        if text_el and actor_el:
                            # 1. Clean Company Name (Remove duplicates)
                            raw_company = actor_el.get_text(separator='|', strip=True)
                            company = raw_company.split('|')[0] # Takes only the first part
            
                            # 2. Split Title and Description
                            full_text = text_el.get_text("\n", strip=True)
                            lines = [line for line in full_text.split('\n') if line.strip()]
                            
                            title = lines[0] if len(lines) > 0 else "N/A"
                            description = "\n".join(lines[1:]) if len(lines) > 1 else ""
                            
                            full_content = title + " " + description
                            is_match = self.is_data_job(full_content)
                            self.logger.info(f"FOUND POST: '{title}'. Matched Data/AI Keywords? {is_match}")
    
                            if not is_match:
                                continue
                            
                            # 3. Handle Date
                            time_val = time_el.get_text(strip=True) if time_el else "0d"
                            pub_date = self.parse_date(time_val)
    
                            # 4. Fill Item
                            item = JobItem()
                            item["title"] = title
                            item["description"] = description
                            item["published_time"] = pub_date
                            item["company"] = company
                            item["url"] = target_url
                            
                            # LinkedIn feed posts don't have these fields. 
                            # Fill with "Non spécifié" so your DB/CSV looks clean.
                            item["category"] = "Non spécifié"
                            item["region"] = "Non spécifié"
                            item["experience"] = "Non spécifié"
                            item["education"] = "Non spécifié"
                            item["contract"] = "Non spécifié"
                            item["company_name_full"] = company
                            yield item
        except Exception as e:
            self.logger.error(f"Error parsing DOM on {target_url}: {e}")
            
        pass # we are outside the else block for login now

        # Only queue the next keyword if we're not paginating jobs.
        # Pagination requests inside parse_job_search are yielded independently.
        try:
            idx = response.meta.get('index', 0)
            is_job_search = response.meta.get('is_job_search', False) or "/jobs/" in target_url or "/search/" in target_url
            has_next_page = response.meta.get('has_next_page', False)
            
            # If we're on a paginated search page and there IS a next page, DO NOT advance the start_url index yet.
            if not has_next_page:
                next_idx = idx + 1
                if next_idx < len(self.start_urls):
                    next_url = self.start_urls[next_idx]
                    yield scrapy.Request(url=next_url, callback=self.parse, meta={'index': next_idx, 'target_url': next_url}, dont_filter=True)
                
        except Exception as e:
            self.logger.error(f"Error yielding next item from {target_url}: {e}")

    def scroll_and_load_all_cards(self):
        """Scrolls the list until no new job cards are loaded."""
        import random
        last_count = 0
        attempts_without_new_cards = 0

        while attempts_without_new_cards < 4:
            # Find the cards currently loaded in the left pane
            current_cards = self.driver.find_elements(By.CSS_SELECTOR, ".job-card-container")
            
            if len(current_cards) == last_count:
                attempts_without_new_cards += 1
            else:
                attempts_without_new_cards = 0 # reset because we found new cards
                
            last_count = len(current_cards)
            
            # Scroll inside the specific left pane container to trigger lazy loading
            try:
                # Target the ul or specific container that holds the jobs to scroll it down
                script = """
                    var container = document.querySelector('.jobs-search-results-list');
                    if(container) { container.scrollBy(0, arguments[0]); }
                    else {
                        var ul = document.querySelector('.scaffold-layout__list-item').parentElement;
                        ul.scrollBy(0, arguments[0]);
                    }
                """
                scroll_amount = random.randint(500, 1000)
                self.driver.execute_script(script, scroll_amount)
            except:
                pass
                
            # Fallback scroll: also bring the last loaded job card into view
            if current_cards:
                try:
                    self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", current_cards[-1])
                except:
                    pass
                    
            # Wait for random time between 2 to 4 seconds to mimic human scroll pace
            time.sleep(random.uniform(2.0, 4.0))
            
            # Support for "See more jobs" button if it appears
            try:
                see_more = self.driver.find_element(By.CSS_SELECTOR, "button.infinite-scroller__show-more-button--visible")
                if see_more.is_displayed():
                    self.driver.execute_script("arguments[0].click();", see_more)
                    time.sleep(2)
            except:
                pass
            
    def get_clean_search_url(self, url, new_start):
        """Builds a clean URL with only keywords, location, and start."""
        parsed = urllib.parse.urlparse(url)
        params = urllib.parse.parse_qs(parsed.query)
        
        # Keep only the parameters we want
        clean_params = {
            'keywords': params.get('keywords', ['data engineer']),
            'location': params.get('location', ['Morocco']),
            'start': [str(new_start)]
        }
        
        # Reconstruct the query string
        new_query = urllib.parse.urlencode(clean_params, doseq=True)
        return f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{new_query}"
    
    def is_relevant_title(self, title):
        title_lower = title.lower()
        # Returns True if any of your keywords are inside the job title
        return any(k.lower() in title_lower for k in self.DATA_KEYWORDS)

    def parse_job_search(self, response, start):
        self.driver.get(response.url)
        time.sleep(5)
        
        MAX_PAGES = 2
        
        for current_page in range(MAX_PAGES):
            self.logger.info("Scraping current page...")
            
            # 1. Scroll and load the cards
            self.scroll_and_load_all_cards()

            # 2. Process job cards on the current page
            job_cards = self.driver.find_elements(By.CSS_SELECTOR, ".job-card-container")
            self.logger.info(f"Processing {len(job_cards)} jobs on this page.")
            
            for i in range(len(job_cards)):
                try:
                    # Refresh the list to avoid StaleElementReference
                    cards = self.driver.find_elements(By.CSS_SELECTOR, ".job-card-container")
                    if i >= len(cards): break
                    card = cards[i]
                    
                    self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", card)
                    card.click()
                    time.sleep(2) 
                    
                    soup = BeautifulSoup(self.driver.page_source, 'html.parser')
                    title_el = soup.select_one('h1')
                    title = title_el.get_text(strip=True) if title_el else "N/A"
                    
                    # FILTER BY TITLE
                    if self.is_relevant_title(title):
                        detail_pane = soup.select_one('.jobs-search__job-details--container')
                        if detail_pane:
                            meta_el = detail_pane.select_one('.job-details-jobs-unified-top-card__tertiary-description-container')
                            raw_text = meta_el.get_text(strip=True) if meta_el else ""
                            
                            parts = raw_text.split('·')
                            clean_loc = parts[0].strip() if len(parts) > 0 else "Non spécifié"
                            
                            time_str = parts[1].strip() if len(parts) > 1 else ""
                            pub_date = self.parse_date(time_str)

                            item = JobItem()
                            item['title'] = title
                            item['company'] = detail_pane.select_one('.job-details-jobs-unified-top-card__company-name').get_text(strip=True) if detail_pane.select_one('.job-details-jobs-unified-top-card__company-name') else "N/A"
                            item['location'] = clean_loc
                            item['published_time'] = pub_date
                            item['description'] = detail_pane.select_one('#job-details').get_text(strip=True) if detail_pane.select_one('#job-details') else "N/A"
                            item['url'] = self.driver.current_url
                            yield item
                    else:
                        self.logger.info(f"Skipping: {title}")
                except Exception as e:
                    self.logger.error(f"Error scraping card {i}: {e}")
                    continue

            # 3. Pagination Logic: CLICK the button
            try:
                # Find the 'Next' button
                # Using XPath is more reliable for 'Next' buttons
                next_button = self.driver.find_element(By.XPATH, "//button[@aria-label='Voir la page suivante']")
                
                # Check if it is clickable
                if next_button.is_displayed() and next_button.is_enabled():
                    self.logger.info("Clicking Next page...")
                    self.driver.execute_script("arguments[0].click();", next_button)
                    time.sleep(5) # Wait for page content to replace
                else:
                    self.logger.info("Next button is disabled or invisible. Finishing search.")
                    break
            except Exception as e:
                self.logger.info("No Next button found. Finishing search.")
                break
        
    def closed(self, reason):
        self.driver.quit()