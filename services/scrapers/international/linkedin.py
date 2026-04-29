import time
from datetime import datetime, timedelta
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

    start_urls = [
        "https://www.linkedin.com/company/stages-portal/posts/",
        "https://www.linkedin.com/company/employment-and-talent-recruitment/posts/",
        "https://www.linkedin.com/groups/3295246/",
        "https://www.linkedin.com/company/stages-recrutement-au-maroc/posts/",
        "https://www.linkedin.com/company/le-stagiaire/posts/",
        "https://www.linkedin.com/company/rh-recrutement-ma/posts/",
        "https://www.linkedin.com/company/anapec/posts/",
        "https://www.linkedin.com/company/livres-gratuits-pdf/posts/",
        "https://www.linkedin.com/company/4recruteee/posts/",
        "https://www.linkedin.com/company/emploi-recrutement/posts/"
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
        target_url = response.meta.get('target_url')
        try:
            self.logger.info(f"Attempting to fetch {target_url}")
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

        try:
            idx = response.meta.get('index', 0)
            next_idx = idx + 1
            if next_idx < len(self.start_urls):
                next_url = self.start_urls[next_idx]
                yield scrapy.Request(url=next_url, callback=self.parse, meta={'index': next_idx, 'target_url': next_url}, dont_filter=True)
                
        except Exception as e:
            self.logger.error(f"Error yielding next item from {target_url}: {e}")
            idx = response.meta.get('index', 0)
            next_idx = idx + 1
            if next_idx < len(self.start_urls):
                next_url = self.start_urls[next_idx]
                yield scrapy.Request(url=next_url, callback=self.parse, meta={'index': next_idx, 'target_url': next_url}, dont_filter=True)

    def closed(self, reason):
        self.driver.quit()