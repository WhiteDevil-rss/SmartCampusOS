import pandas as pd
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models import SynergyRequest, SynergyResponse, SynergyMatch, FacultyResearchProfile

def calculate_synergy(req: SynergyRequest) -> SynergyResponse:
    """
    Computes research synergy between a source faculty and a list of internal profiles.
    Used for interdisciplinary collaboration discovery.
    """
    if not req.profiles:
        return SynergyResponse(matches=[])

    # 1. Prepare data
    source_profile = next((p for p in req.profiles if p.facultyId == req.sourceFacultyId), None)
    
    # If source is not in the profiles provided, we can't compare
    if not source_profile:
        return SynergyResponse(matches=[])

    # Accumulate all text for each person (abstracts + keywords)
    documents = []
    p_map = {} # index -> facultyId
    
    for i, p in enumerate(req.profiles):
        text = " ".join(p.abstracts + p.keywords)
        documents.append(text)
        p_map[i] = p

    # 2. Vectorize using TF-IDF
    vectorizer = TfidfVectorizer(stop_words='english', lowercase=True)
    try:
        tfidf_matrix = vectorizer.fit_transform(documents)
    except ValueError:
        # Happens if documents are empty or only stop words
        return SynergyResponse(matches=[])

    # 3. Calculate Cosine Similarity
    # Find the index of the source faculty
    source_idx = next(i for i, p in p_map.items() if p.facultyId == req.sourceFacultyId)
    
    # Compare source to all others
    cosine_sim = cosine_similarity(tfidf_matrix[source_idx], tfidf_matrix).flatten()

    # 4. Filter and build matches
    matches = []
    feature_names = vectorizer.get_feature_names_out()
    
    for i, score in enumerate(cosine_sim):
        target = p_map[i]
        if target.facultyId == req.sourceFacultyId:
            continue
        
        if score < 0.05: # Skip low similarity
            continue

        # Find shared keywords (using the top words from their respective vectors)
        # For simplicity, we'll just check intersection of their provided keyword lists
        shared = list(set(source_profile.keywords) & set(target.keywords))
        
        # Generate a reason
        dept_rel = "cross-departmental" if target.department != source_profile.department else "departmental"
        reason = f"Strong {dept_rel} overlap in {', '.join(shared[:2]) if shared else 'research methodology'}."
        
        matches.append(SynergyMatch(
            targetFacultyId=target.facultyId,
            score=float(score),
            sharedKeywords=shared,
            reason=reason
        ))

    # Sort matches by score descending
    matches.sort(key=lambda x: x.score, reverse=True)

    return SynergyResponse(matches=matches[:10]) # Return top 10 matches
