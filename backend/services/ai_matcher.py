from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import models

def calculate_match_score(candidate: models.Candidate, job: models.Job) -> tuple[float, dict]:
    """
    Calculates a match score between a candidate and a job based on skills and TF-IDF similarity.
    Returns: (score, breakdown)
    """
    # 1. Skill Matching (Weight: 60%)
    job_skills = set(s.lower() for s in job.skills_required)
    candidate_skills = set(s.lower() for s in (candidate.skills or []))
    
    matched_skills = job_skills.intersection(candidate_skills)
    missing_skills = job_skills - candidate_skills
    
    if not job_skills:
        skill_score = 100.0
    else:
        skill_score = (len(matched_skills) / len(job_skills)) * 100.0
        
    breakdown = {
        "matched": list(matched_skills),
        "missing": list(missing_skills)
    }
    
    # 2. Keyword/Description Matching via TF-IDF (Weight: 40%)
    # Combine candidate text
    candidate_text_parts = []
    if candidate.skills:
        candidate_text_parts.extend(candidate.skills)
    if candidate.experience:
        for exp in candidate.experience:
            candidate_text_parts.append(exp.get('description', ''))
            candidate_text_parts.append(exp.get('role', ''))
    
    candidate_doc = " ".join(candidate_text_parts).lower()
    job_doc = f"{job.title} {job.description}".lower()
    
    tfidf_score = 0.0
    if candidate_doc and job_doc:
        vectorizer = TfidfVectorizer()
        try:
            tfidf_matrix = vectorizer.fit_transform([job_doc, candidate_doc])
            cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            tfidf_score = cosine_sim * 100.0
        except ValueError:
            # Vocabulary empty or other tfidf error
            pass
            
    # Combine scores
    final_score = (skill_score * 0.6) + (tfidf_score * 0.4)
    return round(final_score, 2), breakdown
