import scrapy
import re
from services.scrapers.items import JobItem


class RekruteSpider(scrapy.Spider):
    name = "rekrute"
    source_name = "rekrute"
    BASE_URL = "https://www.rekrute.com"

    # Nombre de pages à scraper (augmente si tu veux plus d'offres)
    MAX_PAGES = 5

    def start_requests(self):
        yield scrapy.Request(
            f"{self.BASE_URL}/offres.html?p=1&s=1&o=1",
            callback=self.parse,
            meta={"page": 1},
        )

    def extract_region(self, title_raw):
        """Extrait la région depuis le titre brut de l'offre."""
        # Méthode 1 : séparateur "|"  ex: "Data Engineer | Casablanca"
        if "|" in title_raw:
            parts = title_raw.split("|")
            if len(parts) >= 2:
                return parts[-1].strip()  # prend la dernière partie (la région)

        # Méthode 2 : regex sur les villes marocaines connues
        villes = (
            r"Casablanca|Rabat|Tanger|Marrakech|Fès|Agadir|Oujda|"
            r"Meknès|Tétouan|Kénitra|Laâyoune|Mohammedia|El Jadida|"
            r"Nador|Beni Mellal|Settat|Khemisset|Guelmim|Safi"
        )
        match = re.search(villes, title_raw, re.IGNORECASE)
        if match:
            return match.group(0)

        return "Non spécifié"

    def clean_title(self, title_raw):
        """Retire la partie région du titre pour garder seulement le poste."""
        if "|" in title_raw:
            return title_raw.split("|")[0].strip()
        return title_raw.strip()

    def parse(self, response):
        listings = response.css("ul.job-list2 li.post-id")

        # ⚠️ Si aucune offre trouvée → log pour débogage
        if not listings:
            self.logger.warning(
                f"Page {response.meta.get('page')} : aucune offre trouvée. "
                f"Le sélecteur CSS a peut-être changé sur Rekrute."
            )

        for li in listings:
            # Titre complet (peut contenir la région ex: "Data Engineer | Casablanca")
            title_raw = li.css("h2 a.titreJob::text").get(default="").strip()

            # Entreprise depuis l'attribut alt de l'image logo
            img_alt = li.css("img.photo::attr(alt)").get(default="").strip()
            company = img_alt if img_alt else "Confidentiel"

            # URL de l'offre
            href = li.css("h2 a.titreJob::attr(href)").get(default="")
            url = self.BASE_URL + href if href else ""

            # Contrat, date, localisation depuis les spans/li de détail
            contract = li.css("span.post-type::text").get(default="").strip()
            date_posted = li.css("span.date::text").get(default="").strip()
            location_raw = li.css("span.location::text").get(default="").strip()

            # Si localisation pas dans un span dédié, on l'extrait du titre
            region = location_raw if location_raw else self.extract_region(title_raw)

            item = JobItem()
            item["title"] = self.clean_title(title_raw)
            item["company"] = company
            item["company_name_full"] = company
            item["region"] = region
            item["location"] = region  # même valeur, champ requis par JobItem
            item["url"] = url
            item["contract"] = contract if contract else None
            item["published_time"] = date_posted if date_posted else None
            # Champs non disponibles dans la vue liste (seulement dans le détail)
            item["description"] = None
            item["category"] = None
            item["remote"] = None
            item["experience"] = None
            item["education"] = None
            item["company_sector"] = None
            item["company_website"] = None
            item["company_description"] = None

            yield item

        # Pagination
        current_page = response.meta.get("page", 1)
        if current_page < self.MAX_PAGES:
            next_page = current_page + 1
            next_url = f"{self.BASE_URL}/offres.html?p={next_page}&s=1&o=1"
            self.logger.info(f"➡️ Page suivante : {next_page}")
            yield scrapy.Request(
                next_url, callback=self.parse, meta={"page": next_page}
            )
        else:
            self.logger.info(f"✅ Scraping Rekrute terminé — {self.MAX_PAGES} pages.")
