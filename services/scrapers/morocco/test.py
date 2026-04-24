import json
from services.scrapers.morocco.rekrute import RekruteScraper


def clean_job(job):
    """Nettoie les données (évite None / champs vides)"""
    return {
        "title": job.get("title", "").strip(),
        "company": job.get("company", "").strip(),
        "region": job.get("region", "").strip(),
        "url": job.get("url", "").strip(),
        "description": job.get("description", "").strip() if job.get("description") else "",
        "contract": job.get("contract", "").strip() if job.get("contract") else "",
        "experience": job.get("experience", "").strip() if job.get("experience") else "",
        "education": job.get("education", "").strip() if job.get("education") else "",
        "category": job.get("category", "").strip() if job.get("category") else "",
    }


def save_to_json(jobs, filename="jobs.json"):
    """Sauvegarde la liste dans un fichier JSON"""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(jobs, f, ensure_ascii=False, indent=4)
    print(f"\n✅ Fichier JSON créé : {filename}")


def main():
    print("Ouverture Rekrute...")

    scraper = RekruteScraper()
    jobs = scraper.scrape()

    print("TOTAL:", len(jobs))

    cleaned_jobs = []

    for job in jobs:
        cleaned = clean_job(job)
        cleaned_jobs.append(cleaned)

        print("-------------------")
        print("TITLE:", cleaned["title"])
        print("COMPANY:", cleaned["company"])
        print("REGION:", cleaned["region"])
        print("URL:", cleaned["url"])

    save_to_json(cleaned_jobs)


if __name__ == "__main__":
    main()