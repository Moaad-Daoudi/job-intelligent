USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/123.0.0.0 Safari/537.36"
)

BOT_NAME = "job_scrapers"
SPIDER_MODULES = ["services.scrapers.morocco", "services.scrapers.international"]
NEWSPIDER_MODULE = "services.scrapers.morocco"

# ─── Pipeline actif ───────────────────────────────────────────────────────────
# LocalFilePipeline  : sauvegarde dans bronze/ local (fichiers JSON)
# MinioBronzePipeline: sauvegarde directement dans MinIO
# → Activer UNE SEULE des deux à la fois
ITEM_PIPELINES = {
    "services.scrapers.pipeline.LocalFilePipeline": 300,
    # "services.scrapers.minioPipeline.MinioBronzePipeline": 300,
}

# ─── Paramètres de politesse ──────────────────────────────────────────────────
CONCURRENT_REQUESTS = 1
DOWNLOAD_DELAY = 3          # secondes entre chaque requête
RANDOMIZE_DOWNLOAD_DELAY = True   # varie entre 0.5× et 1.5× DOWNLOAD_DELAY
ROBOTSTXT_OBEY = False      # certaines sources (LinkedIn) bloquent sinon

# ─── Retry ───────────────────────────────────────────────────────────────────
RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 429]

# ─── FEEDS désactivé ─────────────────────────────────────────────────────────
# ⚠️  Ne pas activer FEEDS en même temps que LocalFilePipeline :
#     ça créerait un doublon (jobs.json + bronze/source/date/offres.json).
#     FEEDS est utile seulement pour des tests rapides sans pipeline.
# FEEDS = {
#     "jobs.json": {
#         "format": "json",
#         "encoding": "utf8",
#         "store_empty": False,
#         "indent": 4,
#     }
# }
