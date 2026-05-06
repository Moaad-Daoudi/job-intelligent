import logging
from scrapy.utils.project import get_project_settings
from scrapy.crawler import CrawlerProcess

# Importez tous vos spiders ici
from services.scrapers.morocco.emploi import EmploiSpider
from services.scrapers.international.linkedin import LinkedInSpider
from services.scrapers.morocco.rekrute import RekruteSpider
# from job_scrapers.spiders.khdma.khdma_spider import KhdmaSpider
from dotenv import load_dotenv

load_dotenv()

def run_scrapers():
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