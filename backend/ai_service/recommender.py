"""
CivicSync AI Service - University & Expertise Recommendation Engine
Matches societal challenges with university departments and industry partners
based on semantic theme overlap, department specializations, and research tags.
"""

from typing import List, Dict, Any

def match_challenge_with_institutions(
    challenge_title: str,
    challenge_description: str,
    category_name: str,
    keywords: List[str],
    universities: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Computes recommendation match scores and rationale between a challenge and universities.
    
    Each university dict contains:
    - 'id': profile ID
    - 'institution_name': name
    - 'campus_location': location
    - 'departments': list of {'id', 'name', 'expertises': ['tag1', 'tag2', ...]}
    """
    challenge_corpus = f"{challenge_title} {challenge_description} {category_name} {' '.join(keywords)}".lower()
    recommendations = []

    for uni in universities:
        best_dept_match = None
        best_score = 0
        matched_tags = []

        for dept in uni.get('departments', []):
            dept_name = dept.get('name', '')
            dept_expertises = dept.get('expertises', [])
            
            score = 15 # Base institutional affinity
            curr_matched_tags = []

            # Check department name affinity
            dept_lower = dept_name.lower()
            if any(term in dept_lower for term in ['civil', 'environment', 'water', 'urban']) and any(c in challenge_corpus for c in ['water', 'flood', 'drainage', 'sewage', 'waste', 'road']):
                score += 35
                curr_matched_tags.append(dept_name)

            if any(term in dept_lower for term in ['computer', 'data', 'information', 'ai']) and any(c in challenge_corpus for c in ['traffic', 'sensor', 'monitoring', 'iot', 'system', 'app', 'tracking']):
                score += 35
                curr_matched_tags.append("Intelligent Systems")

            if any(term in dept_lower for term in ['biotech', 'chemical', 'chemistry']) and any(c in challenge_corpus for c in ['contamination', 'quality', 'waste', 'plastic', 'health']):
                score += 35
                curr_matched_tags.append("Biotechnology & Treatment")

            if any(term in dept_lower for term in ['electrical', 'energy']) and any(c in challenge_corpus for c in ['energy', 'power', 'solar', 'grid']):
                score += 40
                curr_matched_tags.append("Energy Engineering")

            # Check specific expertise tags
            for exp in dept_expertises:
                if exp.lower() in challenge_corpus:
                    score += 20
                    if exp not in curr_matched_tags:
                        curr_matched_tags.append(exp)

            # Cap score at 96%
            score = min(score, 96)

            if score > best_score:
                best_score = score
                best_dept_match = dept
                matched_tags = curr_matched_tags

        if best_score >= 35:
            dept_name = best_dept_match.get('name') if best_dept_match else "Interdisciplinary Research Cell"
            tags_display = matched_tags if matched_tags else [category_name]
            rationale = (
                f"Matched with {uni['institution_name']}'s {dept_name} due to active specialization "
                f"in {', '.join(tags_display[:3])} and relevant civic impact research capabilities."
            )

            recommendations.append({
                "university_id": uni['id'],
                "institution_name": uni['institution_name'],
                "campus_location": uni.get('campus_location', ''),
                "department_name": dept_name,
                "match_score": best_score,
                "matched_expertises": tags_display[:4],
                "rationale": rationale,
                "confidence_label": "High Alignment" if best_score >= 70 else "Moderate Alignment"
            })

    # Sort descending by match score
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)
    return recommendations
