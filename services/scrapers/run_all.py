<<<<<<< HEAD
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
=======
import logging
from scrapy.utils.project import get_project_settings
from scrapy.crawler import CrawlerProcess

# Importez tous vos spiders ici
from services.scrapers.morocco.emploi import EmploiSpider
from services.scrapers.international.linkedin import LinkedInSpider
from services.scrapers.morocco.rekrute import RekruteSpider
# from job_scrapers.spiders.khdma.khdma_spider import KhdmaSpider
from dotenv import load_dotenv
>>>>>>> 6eaea1619630be4faa8474c1aa45b9dffdfeb927

load_dotenv()

def run_scrapers():
<<<<<<< HEAD
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
=======
    # 1. Charge la configuration depuis settings.py
    # C'est crucial : cela charge automatiquement votre PIPELINE, USER_AGENT, etc.
    settings = get_project_settings()
    
    # 2. Initialise le processus de crawl
    process = CrawlerProcess(settings)
    
    # 3. Planifie les spiders
    # Scrapy gère la concurrence nativement(In parallel). Tous ces spiders tourneront en parallèle.
    process.crawl(EmploiSpider)
    # process.crawl(LinkedInSpider)
    # process.crawl(RekruteSpider)
    # process.crawl(KhdmaSpider)
    
    # 4. Démarre tout le processus
    process.start()

if __name__ == "__main__":
    # Configure le logging pour voir ce qui se passe dans la console
    logging.basicConfig(level=logging.INFO)
    print("🚀 Démarrage de tous les spiders en mode concurrent...")
    run_scrapers()
    print("✅ Scraping terminé !")
>>>>>>> 6eaea1619630be4faa8474c1aa45b9dffdfeb927
