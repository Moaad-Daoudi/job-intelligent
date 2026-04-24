import re


def clean(text):
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def format_job(job):
    return {
        "title": clean(job.get("title")),
        "company": clean(job.get("company")),
        "region": clean(job.get("region")),
        "category": clean(job.get("category")),
        "contract": clean(job.get("contract")),
        "experience": clean(job.get("experience")),
        "education": clean(job.get("education")),
        "description": clean(job.get("description")),
        "url": job.get("url"),
        "source": "emploi.ma" if "emploi.ma" in job.get("url", "") else "rekrute"
    }


def format_jobs(jobs):
    return [format_job(j) for j in jobs]