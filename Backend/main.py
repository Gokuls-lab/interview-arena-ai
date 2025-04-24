import os
import json
import fitz  # PyMuPDF
import faiss
import numpy as np
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import Counter
from typing import List
from google import generativeai as genai
import pdfplumber

app = Flask(__name__)

# Configuration
GEMINI_API_KEY = "AIzaSyBQgUq_pscmRRw36Y7HKt3dvDTgKTQvUA4"
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set.")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize models
model = SentenceTransformer('all-MiniLM-L6-v2')
embedding_dim = 384

# Initialize or load FAISS index and questions database
index_file = "faiss_index.index"
questions_file = "questions_db.json"

if os.path.exists(index_file) and os.path.exists(questions_file):
    faiss_index = faiss.read_index(index_file)
    with open(questions_file, 'r') as f:
        questions_db = json.load(f)
else:
    faiss_index = faiss.IndexFlatIP(embedding_dim)
    questions_db = []

# Helper functions
def normalize_embeddings(embeddings):
    return normalize(embeddings, norm='l2', axis=1)

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def extract_keywords_with_gemini(text: str) -> List[str]:
    prompt = (
        "Extract the most relevant keywords from this text, focusing on technical terms, "
        "tools, and concepts. Return only a comma-separated list of keywords.\n\n"
        f"{text}"
    )
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    keywords_text = response.text
    keywords = [kw.strip().lower() for kw in keywords_text.split(",") if kw.strip()]
    return keywords

def get_matched_keywords(question: str, keywords: List[str]):
    question_words = set(question.lower().split())
    return [kw for kw in keywords if kw.lower() in question_words]

def is_high_quality_question(question: str) -> bool:
    return len(question.split()) > 5 and '?' in question

def expand_keywords(keywords: List[str]) -> List[str]:
    expanded = set(keywords)
    tech_synonyms = {
        'ai': ['artificial intelligence', 'machine learning'],
        'python': ['django', 'flask'],
        'javascript': ['js', 'node', 'react']
    }
    
    for kw in keywords:
        if kw in tech_synonyms:
            expanded.update(tech_synonyms[kw])
    return list(expanded)

# Improved search algorithm
def get_question_matches_from_keywords(keywords: List[str], threshold: float = 0.7, top_k: int = 5):
    if not questions_db:
        return []

    # Expand keywords with synonyms
    expanded_keywords = expand_keywords(keywords)
    
    # Calculate TF-IDF weights - only for our keywords
    vectorizer = TfidfVectorizer(vocabulary=expanded_keywords)
    documents = [" ".join(expanded_keywords)] + [" ".join(q.split()[:20]) for q in questions_db]
    tfidf_matrix = vectorizer.fit_transform(documents)
    
    # Get weights for our keywords only
    keyword_weights = tfidf_matrix[0].toarray()[0]
    
    # Generate embeddings and apply weights
    keyword_embeddings = model.encode(expanded_keywords)
    weighted_embeddings = keyword_embeddings * keyword_weights.reshape(-1, 1)
    doc_embedding = np.sum(weighted_embeddings, axis=0).reshape(1, -1)
    doc_embedding = normalize_embeddings(doc_embedding)

    # Search in FAISS index
    scores, indices = faiss_index.search(doc_embedding, top_k*2)  # Get extra for filtering

    # Process results
    results = []
    for idx, score in zip(indices[0], scores[0]):
        if idx >= 0 and score >= threshold:
            question = questions_db[idx]
            if not is_high_quality_question(question):
                continue
                
            matched_kws = get_matched_keywords(question, expanded_keywords)
            if not matched_kws:
                continue
                
            results.append({
                "question": question,
                "similarity": float(score),
                "matched_keywords": matched_kws,
                "match_count": len(matched_kws)
            })
    
    # Sort by score and match count
    results.sort(key=lambda x: (x['similarity'], x['match_count']), reverse=True)
    return results[:top_k]
# API Endpoints
@app.route("/store_question/", methods=["POST"])
def store_question():
    try:
        data = request.get_json()
        question = data.get("question")
        
        if not question or not is_high_quality_question(question):
            return jsonify({"error": "Please provide a valid question (minimum 5 words ending with ?)"}), 400
            
        embedding = model.encode([question])
        embedding = normalize_embeddings(embedding)
        faiss_index.add(embedding)
        questions_db.append(question)

        # Persist data
        faiss.write_index(faiss_index, index_file)
        with open(questions_file, 'w') as f:
            json.dump(questions_db, f)

        return jsonify({
            "message": "Question stored successfully",
            "question": question,
            "embedding_shape": embedding.shape
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/analyze_pdf_and_get_similar_questions/", methods=["POST"])
def analyze_pdf():
    try:
        data = request.get_json()
        if not data or 'file_path' not in data:
            return jsonify({"error": "file_path is required"}), 400
            
        file_path = data['file_path']
        threshold = float(data.get('threshold', 0.75))
        top_k = int(data.get('top_k', 5))

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        # Extract and process text
        text = extract_text_from_pdf(file_path)
        keywords = extract_keywords_with_gemini(text)
        
        # Get matches
        detailed_results = get_question_matches_from_keywords(keywords, threshold=threshold, top_k=top_k)
        
        # Extract just the questions for the simplified output
        matched_questions = [result['question'] for result in detailed_results]

        return jsonify({
            "file_path": file_path,
            "keywords": keywords,
            "detailed_results": detailed_results,  # Keep the full details
            "matched_questions": matched_questions  # New simplified list
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/search/", methods=["POST"])
def semantic_search():
    try:
        data = request.get_json()
        query = data.get("query")
        
        if not query:
            return jsonify({"error": "query parameter is required"}), 400
            
        # Encode query
        query_embedding = model.encode([query])
        query_embedding = normalize_embeddings(query_embedding)

        # Search
        scores, indices = faiss_index.search(query_embedding, 5)
        
        # Format results
        results = []
        for idx, score in zip(indices[0], scores[0]):
            if idx >= 0 and score >= 0.5:  # Lower threshold for direct search
                results.append({
                    "question": questions_db[idx],
                    "similarity": float(score)
                })
        
        return jsonify({"query": query, "results": results})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)