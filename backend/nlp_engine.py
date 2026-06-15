import re
from typing import List, Dict, Set, Tuple

# Common English and French stopwords to clean description and biography texts
STOPWORDS = {
    # English
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could",
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
    "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's",
    "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm",
    "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't",
    "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
    "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't",
    "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't",
    "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's",
    "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
    "yourselves",
    # French
    "au", "aux", "avec", "ce", "ces", "dans", "de", "des", "du", "elle", "en", "et", "eux", "il", "ils", "je", "la",
    "le", "les", "leur", "lui", "ma", "mais", "me", "même", "mes", "moi", "mon", "ne", "nos", "notre", "nous", "on",
    "ou", "par", "pas", "pour", "qu", "que", "qui", "sa", "se", "ses", "son", "sur", "ta", "te", "tes", "toi", "ton",
    "tu", "un", "une", "vos", "votre", "vous", "y", "à", "était", "étaient", "fut", "furent", "avec", "pour", "sans"
}

class JobMatchEngine:
    @staticmethod
    def clean_text(text: str) -> List[str]:
        """Tokenize, lowercase and remove punctuation and common stopwords."""
        if not text:
            return []
        # Keep letters and numbers, remove special characters
        words = re.findall(r'\b[a-zA-Z0-9éèàùçâêîôûëïüäöß]+\b', text.lower())
        return [w for w in words if w not in STOPWORDS and len(w) > 1]

    @staticmethod
    def get_bigrams(words: List[str]) -> Set[Tuple[str, str]]:
        """Generate bigrams from clean word list to improve contextual alignment."""
        if len(words) < 2:
            return set()
        return set(zip(words[:-1], words[1:]))

    @staticmethod
    def normalize_string(s: str) -> str:
        """Remove whitespaces, dashes, and lowercase for robust matching."""
        if not s:
            return ""
        return re.sub(r'[\s\-_]', '', s.lower())

    @classmethod
    def calculate_text_similarity(cls, text_a: str, text_b: str) -> float:
        """Compute Jaccard similarity of unigrams and bigrams for contextual descriptions."""
        words_a = cls.clean_text(text_a)
        words_b = cls.clean_text(text_b)
        
        if not words_a or not words_b:
            return 0.0
            
        set_a = set(words_a)
        set_b = set(words_b)
        
        # Unigram Jaccard
        unigram_intersection = len(set_a.intersection(set_b))
        unigram_union = len(set_a.union(set_b))
        unigram_sim = unigram_intersection / unigram_union if unigram_union > 0 else 0.0
        
        # Bigram Jaccard
        bigrams_a = cls.get_bigrams(words_a)
        bigrams_b = cls.get_bigrams(words_b)
        if bigrams_a and bigrams_b:
            bigram_intersection = len(bigrams_a.intersection(bigrams_b))
            bigram_union = len(bigrams_a.union(bigrams_b))
            bigram_sim = bigram_intersection / bigram_union if bigram_union > 0 else 0.0
            # Weighted average favoring bigrams (structures) slightly
            return (unigram_sim * 0.4) + (bigram_sim * 0.6)
            
        return unigram_sim

    @classmethod
    def calculate_title_similarity(cls, candidate_title: str, job_title: str) -> float:
        """Calculate alignment between candidate's current role title and the job's title."""
        if not candidate_title or not job_title:
            return 0.2  # Baseline profile interest
            
        c_title_clean = candidate_title.lower()
        j_title_clean = job_title.lower()
        
        c_words = set(cls.clean_text(candidate_title))
        j_words = set(cls.clean_text(job_title))
        
        if not c_words or not j_words:
            return 0.2
            
        # Determine seniority tags to apply penalties/bonuses
        senior_terms = {'senior', 'sr', 'lead', 'principal', 'director', 'architect', 'expert', 'head', 'chef'}
        junior_terms = {'junior', 'jr', 'entry', 'intern', 'stagiaire', 'stage', 'assistant', 'associé', 'associate'}
        
        c_is_senior = any(w in senior_terms for w in c_words) or any(t in c_title_clean for t in ['senior', 'lead', 'expert'])
        j_is_senior = any(w in senior_terms for w in j_words) or any(t in j_title_clean for t in ['senior', 'lead', 'expert'])
        
        c_is_junior = any(w in junior_terms for w in c_words) or any(t in c_title_clean for t in ['junior', 'intern', 'stage'])
        j_is_junior = any(w in junior_terms for w in j_words) or any(t in j_title_clean for t in ['junior', 'intern', 'stage'])
        
        # Word overlap
        overlap = c_words.intersection(j_words)
        base_score = len(overlap) / max(len(c_words), len(j_words))
        
        # Check domain clusters (e.g. data, scientist, engineer, software, developer, web)
        domain_overlap = False
        domain_keywords = {'data', 'scientist', 'engineer', 'nlp', 'ai', 'ml', 'machine', 'learning', 'developer', 'software', 'bi', 'analyst', 'cloud'}
        c_domains = {w for w in c_words if w in domain_keywords}
        j_domains = {w for w in j_words if w in domain_keywords}
        if c_domains and j_domains:
            domain_overlap = len(c_domains.intersection(j_domains)) > 0
            # Boost if there is domain alignment
            base_score = max(base_score, len(c_domains.intersection(j_domains)) / max(len(c_domains), len(j_domains)))
        
        # Title penalty adjustments
        penalty = 0.0
        if j_is_senior and c_is_junior:
            penalty = 0.45  # Substantial gap: Junior applying for Senior role
        elif j_is_senior and not c_is_senior:
            penalty = 0.25  # Mid applying for Senior role
        elif j_is_junior and c_is_senior:
            penalty = 0.15  # Senior applying for Junior role (overqualification)
            
        final_score = max(0.1, base_score - penalty)
        
        # If titles are identical
        if c_title_clean == j_title_clean:
            return 1.0
            
        # If candidate title is closely contained in job title or vice versa
        if cls.normalize_string(candidate_title) in cls.normalize_string(job_title) or cls.normalize_string(job_title) in cls.normalize_string(candidate_title):
            final_score = max(final_score, 0.85 - penalty)
            
        return final_score

    @classmethod
    def match_skills(cls, candidate_skills_str: str, job_skills_str: str) -> Tuple[float, List[str], List[str]]:
        """
        Evaluate required vs. candidate skills.
        Returns:
          - score: percentage float (0.0 to 1.0)
          - matched_skills: list of matching skill names
          - missing_skills: list of skills required by job but missing on candidate
        """
        if not job_skills_str or not job_skills_str.strip():
            return 1.0, [], [] # If job requires no skills, it's a 100% skill match
            
        # Parse skills strings (handle comma-separated, list-like strings)
        c_skills = [s.strip() for s in candidate_skills_str.split(',') if s.strip()] if candidate_skills_str else []
        j_skills = [s.strip() for s in job_skills_str.split(',') if s.strip()]
        
        if not c_skills:
            return 0.0, [], j_skills
            
        matched_skills = []
        missing_skills = []
        
        # Create mapping of normalized forms to ease lookup
        c_normalized_map = {cls.normalize_string(s): s for s in c_skills}
        
        for js in j_skills:
            js_norm = cls.normalize_string(js)
            match_found = False
            
            # 1. Direct exact or normalized check
            if js_norm in c_normalized_map:
                matched_skills.append(js)
                match_found = True
            else:
                # 2. Sub-phrase checks (e.g. candidate has "Apache Spark", job has "Spark", or vice versa)
                for cs_norm, cs_orig in c_normalized_map.items():
                    if js_norm in cs_norm or cs_norm in js_norm:
                        matched_skills.append(js)
                        match_found = True
                        break
            
            if not match_found:
                missing_skills.append(js)
                
        # Calculate skills overlap ratio
        skills_matched_ratio = len(matched_skills) / len(j_skills)
        
        # Give candidate a small bonus if they possess extra skills not strictly requested (shows adaptability)
        extra_skills_count = max(0, len(c_skills) - len(matched_skills))
        extra_bonus = min(0.1, extra_skills_count * 0.02)
        
        final_skills_score = min(1.0, skills_matched_ratio + extra_bonus)
        
        return final_skills_score, matched_skills, missing_skills

    @classmethod
    def analyze_match(cls, candidate: Dict, job: Dict) -> Dict:
        """
        Calculates total match profile between a candidate and a job.
        
        Candidate dict keys: 'skills', 'title', 'bio'
        Job dict keys: 'skills', 'title', 'description'
        """
        c_skills = candidate.get('skills') or ""
        c_title = candidate.get('title') or ""
        c_bio = candidate.get('bio') or ""
        
        j_skills = job.get('skills') or ""
        j_title = job.get('title') or ""
        j_desc = job.get('description') or ""
        
        # 1. Compute components
        skills_score, matched, missing = cls.match_skills(c_skills, j_skills)
        title_score = cls.calculate_title_similarity(c_title, j_title)
        context_score = cls.calculate_text_similarity(c_bio, j_desc)
        
        # 2. Weighted total score
        # 50% Skills, 30% Job Title, 20% Bio Context
        weighted_score = (skills_score * 0.5) + (title_score * 0.3) + (context_score * 0.2)
        final_score_pct = int(round(weighted_score * 100))
        
        # Bounded between 0 and 100
        final_score_pct = max(0, min(100, final_score_pct))
        
        # 3. Determine fit level
        if final_score_pct >= 80:
            fit_level = "Excellent"
        elif final_score_pct >= 60:
            fit_level = "Good"
        elif final_score_pct >= 40:
            fit_level = "Average"
        else:
            fit_level = "Poor"
            
        # 4. Generate dynamic explanation
        explanation = cls.generate_explanation(
            final_score_pct, fit_level, c_title, j_title, matched, missing
        )
        
        return {
            "score": final_score_pct,
            "fit_level": fit_level,
            "matched_skills": matched,
            "missing_skills": missing,
            "explanation": explanation
        }

    @classmethod
    def generate_explanation(cls, score: int, fit: str, c_title: str, j_title: str, matched: List[str], missing: List[str]) -> str:
        """Compose human-readable professional description summarizing the match."""
        if not c_title and not matched:
            return "Please update your candidate profile (title and skills) in your dashboard to receive an accurate, comprehensive AI analysis."
            
        parts = []
        
        # Title alignment sentence
        title_norm_c = c_title.lower() if c_title else ""
        title_norm_j = j_title.lower() if j_title else ""
        
        if title_norm_c and title_norm_j:
            if title_norm_c == title_norm_j:
                parts.append(f"Your professional title matches the required role '{j_title}' perfectly.")
            elif any(w in title_norm_c for w in title_norm_j.split()):
                parts.append(f"Your background as a '{c_title}' is highly relevant to this '{j_title}' listing.")
            else:
                parts.append(f"Although your current role is '{c_title}', this '{j_title}' opportunity presents a pathway to shift your focus.")
        else:
            parts.append(f"Analyzing alignment for the '{j_title}' role.")
            
        # Skills alignment sentence
        if matched:
            skills_preview = ", ".join(matched[:3])
            if len(matched) > 3:
                skills_preview += f", and {len(matched) - 3} more"
            parts.append(f"You have key skills demanded by the recruiter, including {skills_preview}.")
        else:
            parts.append("We couldn't detect explicit skills matches between your listed profile and the job description.")
            
        # Skills gaps and upskilling sentence
        if missing:
            gaps_preview = ", ".join(missing[:2])
            if len(missing) > 2:
                gaps_preview += f" or {missing[2]}"
            
            if fit in ["Excellent", "Good"]:
                parts.append(f"Familiarity with {gaps_preview} would complete your qualifications and make your application stand out.")
            else:
                parts.append(f"To raise your compatibility score, we highly recommend upskilling in {gaps_preview}.")
        else:
            parts.append("You satisfy all technical skill keywords specified in the posting!")
            
        # Final summary sentence
        if fit == "Excellent":
            parts.append("This is an exceptional match. Your skills and profile place you in the top tier of prospective candidates!")
        elif fit == "Good":
            parts.append("This is a strong match. You display a solid combination of core skills suitable for succeeding in this role.")
        elif fit == "Average":
            parts.append("This is an average match. Some skill gaps or title differences exist, but you meet several basic prerequisites.")
        else:
            parts.append("This is a poor match. We suggest targeting positions that align more closely with your current skill set or adding more details to your profile.")
            
        return " ".join(parts)
