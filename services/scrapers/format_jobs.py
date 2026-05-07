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
        "url": job.get("url", ""),
        "source": "rekrute"
    }


def format_jobs(jobs):
    return [format_job(j) for j in jobs]