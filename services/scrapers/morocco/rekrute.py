import requests
from bs4 import BeautifulSoup
import re


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
    # EXTRACTION REGION ROBUSTE
    # ---------------------------
    def extract_region(self, title_raw):

        # 1️⃣ méthode simple "|"
        if "|" in title_raw:
            parts = title_raw.split("|")
            return parts[1].strip()

        # 2️⃣ regex fallback (Rabat, Casablanca etc.)
        match = re.search(r"(Casablanca|Rabat|Tanger|Marrakech|Fès|Agadir)", title_raw)
        if match:
            return match.group(1)

        return ""

    # ---------------------------
    # PARSE JOB
    # ---------------------------
    def parse_job(self, li):

        title_tag = li.select_one("h2 a.titreJob")
        title_raw = title_tag.get_text(strip=True) if title_tag else ""

        title = title_raw
        region = self.extract_region(title_raw)

        # company
        img = li.select_one("img.photo")
        company = img.get("alt", "").strip() if img else ""

        if not company:
            company = "Confidentiel"

        # url
        url_tag = li.select_one("h2 a.titreJob")
        url = ""

        if url_tag and url_tag.get("href"):
            url = self.BASE_URL + url_tag["href"]

        return {
            "title": title,
            "company": company,
            "region": region,
            "url": url
        }

    # ---------------------------
    # SCRAPE PAGE
    # ---------------------------
    def scrape_page(self, page=1):

        url = f"{self.BASE_URL}/offres.html?p={page}&s=1&o=1"
        soup = self.get_soup(url)

        jobs = []
        listings = soup.select("ul.job-list2 li.post-id")

        for li in listings:
            jobs.append(self.parse_job(li))

        return jobs

    # ---------------------------
    # SCRAPE ALL
    # ---------------------------
    def scrape(self, max_pages=1):

        all_jobs = []

        for page in range(1, max_pages + 1):
            print(f"Scraping page {page}...")
            all_jobs.extend(self.scrape_page(page))

        return all_jobs
