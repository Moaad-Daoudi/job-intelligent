import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin


class RekruteScraper:
    BASE_URL = "https://www.rekrute.com"

    def __init__(self):
        self.session = requests.Session()
        self.headers = {
            "User-Agent": "Mozilla/5.0"
        }

    def get_soup(self, url):
        res = self.session.get(url, headers=self.headers)
        return BeautifulSoup(res.text, "html.parser")

    # ---------------------------
    # LIST PAGE (jobs list)
    # ---------------------------
    def scrape_page(self, page=1):
        url = f"{self.BASE_URL}/offres.html?p={page}&s=1&o=1"
        soup = self.get_soup(url)

        jobs = []
        listings = soup.select("ul.job-list2 li.post-id")

        for li in listings:
            job = self.parse_list_job(li)

            # 🔥 IMPORTANT: scrape detail page
            if job["url"]:
                detail = self.scrape_job_detail(job["url"])
                job.update(detail)

            jobs.append(job)

        return jobs

    # ---------------------------
    # LIST PARSER
    # ---------------------------
    def parse_list_job(self, li):

        title_tag = li.select_one("h2 a.titreJob")
        title = title_tag.get_text(strip=True) if title_tag else ""

        url = ""
        if title_tag and title_tag.get("href"):
            url = urljoin(self.BASE_URL, title_tag["href"])

        img = li.select_one("img.photo")
        company = img.get("alt", "").strip() if img else "Confidentiel"

        # region parfois dans titre
        region = self.extract_region(title)

        return {
            "title": title,
            "company": company,
            "region": region,
            "url": url
        }

    # ---------------------------
    # DETAIL PAGE SCRAPING 🔥
    # ---------------------------
    def scrape_job_detail(self, url):
        soup = self.get_soup(url)

        # description
        desc_tag = soup.select_one(".info span")
        description = desc_tag.get_text(" ", strip=True) if desc_tag else ""

        # extra infos list
        lis = soup.select(".info ul li")

        contract = ""
        experience = ""
        education = ""
        category = ""

        for li in lis:
            text = li.get_text(" ", strip=True)

            if "contrat" in text.lower():
                contract = text
            elif "expérience" in text.lower():
                experience = text
            elif "niveau" in text.lower() or "étude" in text.lower():
                education = text
            elif "secteur" in text.lower():
                category = text

        return {
            "description": description,
            "contract": contract,
            "experience": experience,
            "education": education,
            "category": category
        }

    # ---------------------------
    # REGION EXTRACTION
    # ---------------------------
    def extract_region(self, title):
        if "|" in title:
            return title.split("|")[-1].strip()

        match = re.search(r"(Casablanca|Rabat|Tanger|Marrakech|Fès|Agadir)", title)
        return match.group(1) if match else ""

    # ---------------------------
    # MAIN SCRAPER
    # ---------------------------
    def scrape(self, max_pages=1):
        all_jobs = []

        for page in range(1, max_pages + 1):
            print(f"Scraping page {page}...")
            all_jobs.extend(self.scrape_page(page))

        return all_jobs
