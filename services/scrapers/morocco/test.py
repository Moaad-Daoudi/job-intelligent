import json
from services.scrapers.morocco.rekrute import RekruteScraper


def save_json(data, filename="jobs.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"✅ JSON sauvegardé : {filename}")


def main():
    scraper = RekruteScraper()

    jobs = scraper.scrape(max_pages=1)

    print("TOTAL:", len(jobs))

    for job in jobs[:5]:
        print("-------------------")
        print(job["title"])
        print(job["company"])
        print(job["region"])

    save_json(jobs)


if __name__ == "__main__":
    main()