"""
CivicSync AI Service - Semantic Similarity & Duplicate Detection
Uses sentence-transformers/all-MiniLM-L6-v2 for dense embedding comparison.
Gracefully degrades to scikit-learn TF-IDF cosine similarity if SBERT or PyTorch
is not present, clearly disclosing the engine used.
"""

import logging
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# Global cached SBERT model
_SBERT_MODEL = None
_SBERT_LOAD_ATTEMPTED = False

def get_sbert_model():
    """Lazily load SentenceTransformer model if available."""
    global _SBERT_MODEL, _SBERT_LOAD_ATTEMPTED
    if _SBERT_LOAD_ATTEMPTED:
        return _SBERT_MODEL
    _SBERT_LOAD_ATTEMPTED = True
    try:
        from sentence_transformers import SentenceTransformer
        logger.info("Loading SBERT model all-MiniLM-L6-v2...")
        _SBERT_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("SBERT model loaded successfully.")
    except Exception as e:
        logger.warning(f"SBERT model unavailable ({e}). Using TF-IDF cosine similarity fallback.")
        _SBERT_MODEL = None
    return _SBERT_MODEL

def calculate_similarity_with_corpus(
    query_title: str,
    query_description: str,
    candidates: List[Dict[str, Any]],
    threshold: float = 0.25
) -> Dict[str, Any]:
    """
    Computes semantic similarity between a query challenge and a list of existing candidate challenges.
    
    Each candidate dictionary should have:
    - 'id': challenge ID
    - 'challenge_code': readable code
    - 'title': challenge title
    - 'description': description
    - 'city': city
    - 'category_name': category
    - 'status': status
    """
    if not candidates:
        return {
            "engine": "none",
            "matches": []
        }

    query_text = f"{query_title.strip()} - {query_description.strip()}"
    corpus_texts = [f"{c['title'].strip()} - {c['description'].strip()}" for c in candidates]

    model = get_sbert_model()
    engine_name = "SBERT all-MiniLM-L6-v2 (Dense Embeddings)" if model is not None else "TF-IDF Vectorizer (Cosine Similarity Fallback)"

    if model is not None:
        try:
            query_embedding = model.encode([query_text])
            corpus_embeddings = model.encode(corpus_texts)
            scores = cosine_similarity(query_embedding, corpus_embeddings)[0]
        except Exception as err:
            logger.error(f"SBERT encoding error: {err}. Falling back to TF-IDF.")
            vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
            tfidf_matrix = vectorizer.fit_transform([query_text] + corpus_texts)
            scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
            engine_name = "TF-IDF Vectorizer (Cosine Similarity Fallback)"
    else:
        vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        tfidf_matrix = vectorizer.fit_transform([query_text] + corpus_texts)
        scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]

    matches = []
    for idx, score in enumerate(scores):
        score_val = float(score)
        if score_val >= threshold:
            cand = candidates[idx]
            matches.append({
                "id": cand['id'],
                "challenge_code": cand.get('challenge_code', ''),
                "title": cand['title'],
                "city": cand.get('city', ''),
                "category_name": cand.get('category_name', ''),
                "status": cand.get('status', ''),
                "similarity_score": round(score_val * 100, 1),
                "is_high_similarity": score_val >= 0.70
            })

    # Sort descending by score
    matches.sort(key=lambda x: x['similarity_score'], reverse=True)

    return {
        "engine": engine_name,
        "is_neural_model": model is not None,
        "total_compared": len(candidates),
        "matches": matches[:8] # Top 8 most similar
    }
