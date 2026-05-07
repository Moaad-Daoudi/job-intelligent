"""
run_all.py
----------
Lance tous les scrapers actifs en un seul commande.

USAGE (depuis la racine du projet) :
    python -m services.scrapers.run_all
"""

import logging
from scrapy.utils.project import get_project_settings
from scrapy.crawler import CrawlerProcess
from dotenv import load_dotenv

from services.scrapers.morocco.rekrute import RekruteSpider
from services.scrapers.morocco.emploi import EmploiSpider
# from services.scrapers.morocco.khdma import KhdmaSpider
# from services.scrapers.morocco.bayt import BaytSpider
# from services.scrapers.international.linkedin import LinkedInSpider

load_dotenv()

def run_scrapers():
    settings = get_project_settings()
    process = CrawlerProcess(settings)

    # ── Scrapers Maroc ────────────────────────────────────────────────────────
    process.crawl(RekruteSpider)
    process.crawl(EmploiSpider)
    # process.crawl(KhdmaSpider)
    # process.crawl(BaytSpider)

    # ── Scrapers International (optionnel) ────────────────────────────────────
    # process.crawl(LinkedInSpider)

    process.start()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("🚀 Démarrage des scrapers...")
    run_scrapers()
    print("✅ Scraping terminé ! Les offres sont dans bronze/")
