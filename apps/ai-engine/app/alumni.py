from typing import List, Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models import AlumniMatchRequest, AlumniMatchResponse, AlumniMatch, AlumniProfile

def match_student_to_alumni(req: AlumniMatchRequest) -> AlumniMatchResponse:
    """
    Matches a student to relevant alumni based on skills, interest areas, and experience.
    Uses TF-IDF for semantic matching of skill sets.
    """
    if not req.alumniProfiles:
        return AlumniMatchResponse(matches=[])

    # 1. Prepare Data
    # Student "document" is a combination of their skills and interests
    student_text = " ".join(req.skills + req.interestAreas)
    
    alumni_texts = []
    for p in req.alumniProfiles:
        # Alumni "document" is their skills, current role/company, and past experience
        exp_text = " ".join([e.get('company', '') + " " + e.get('role', '') for e in p.experience])
        alumni_texts.append(" ".join(p.skills) + " " + (p.currentRole or "") + " " + (p.currentCompany or "") + " " + exp_text)

    # 2. Vectorize using TF-IDF
    # Include student in the matrix at index 0
    all_docs = [student_text] + alumni_texts
    
    vectorizer = TfidfVectorizer(stop_words='english', lowercase=True)
    try:
        tfidf_matrix = vectorizer.fit_transform(all_docs)
    except ValueError:
        # Happens if docs are empty
        return AlumniMatchResponse(matches=[])

    # 3. Calculate Cosine Similarity
    # Compare student (idx 0) to all alumni (idx 1 onwards)
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    # 4. Build Matches
    matches = []
    for i, score in enumerate(similarities):
        profile = req.alumniProfiles[i]
        
        # Calculate common skills directly for transparency
        common = list(set(req.skills) & set(profile.skills))
        
        # Heuristic for "Match Reason"
        reason = ""
        if score > 0.4:
            reason = f"Excellent overlap in {', '.join(common[:2]) if common else 'industry focus'}."
        elif profile.currentCompany:
            reason = f"Works at {profile.currentCompany} in a {profile.currentRole or 'related'} role."
        else:
            reason = f"Shares {len(common)} key skill(s) including {common[0] if common else 'domain basics'}."

        matches.append(AlumniMatch(
            alumnusId=profile.studentId,
            alumnusUserId=profile.userId,
            name=profile.name,
            score=float(score),
            commonSkills=common,
            matchReason=reason
        ))

    # Sort by score descending
    matches.sort(key=lambda x: x.score, reverse=True)

    # 5. Extract Top Skills in Demand (global stats for the student)
    all_alumni_skills = [s for p in req.alumniProfiles for s in p.skills]
    top_skills = [skill for skill, _ in Counter(all_alumni_skills).most_common(5)]

    return AlumniMatchResponse(
        matches=matches[:10], # Return top 10 matches
        topSkillsInDemand=top_skills
    )
