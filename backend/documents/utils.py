import PyPDF2
import docx
import re
import textstat
import torch
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .models import Document
import logging
from transformers import pipeline

logger = logging.getLogger(__name__)

def extract_text_from_file(file):
    """Extract text with better error handling."""
    text = ""
    logger.info(f"Starting extraction for {file.name}")
    if file.name.lower().endswith('.pdf'):
        try:
            file.seek(0)
            reader = PyPDF2.PdfReader(file)
            if not reader.pages:
                raise ValueError("PDF has no readable pages")
            for i, page in enumerate(reader.pages[:20]):
                chunk = page.extract_text() or ''
                text += chunk + "\n"
                if i >= 3 and len(text) < 100:
                    raise ValueError("PDF looks image-based")
            if len(text.strip()) < 100:
                raise ValueError("PDF contains insufficient text")
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            raise ValueError(f"Failed to extract PDF text: {e}")

    elif file.name.lower().endswith('.docx'):
        try:
            doc = docx.Document(file)
            text = "\n".join(p.text for p in doc.paragraphs)
        except Exception as e:
            logger.error(f"DOCX extraction error: {e}")
            raise ValueError(f"Failed to extract DOCX text: {e}")

    elif file.name.lower().endswith('.txt'):
        text = file.read().decode('utf-8', errors='ignore')

    else:
        raise ValueError("Unsupported format. Only PDF, DOCX, TXT allowed.")

    logger.info(f"Extracted {len(text)} characters")
    return text.strip()


def analyze_text(content_hash, text):
    """
    Plagiarism detection via character 5-gram sliding windows
    against all other docs (excluding the one with this hash).
    """
    # fetch all other documents' contents
    others = list(
        Document.objects
        .exclude(content_hash=content_hash)
        .values_list('content', flat=True)
    )
    if not others:
        return {'score': 0.0, 'highlights': []}

    # vectorize full text + others
    vec = TfidfVectorizer(analyzer='char', ngram_range=(5, 5))
    corpus = [text] + others
    mat = vec.fit_transform(corpus)
    base_vec = mat[0]

    window = 200
    step = 100
    total = len(text)
    matched = set()
    highlights = []

    for start in range(0, total - window + 1, step):
        snippet = text[start:start + window]
        sim = cosine_similarity(vec.transform([snippet]), mat[1:])[0]
        # find any doc with similarity > threshold
        if sim.max() > 0.3:
            end = start + window
            # mark chars
            matched.update(range(start, end))
            highlights.append({
                'type': 'plagiarism',
                'position': calculate_position(text, start, end)
            })

    score = round(len(matched) / total * 100, 1) if total else 0.0
    return {
        'score': min(score, 100.0),
        'highlights': highlights
    }


def check_ai_probability(text, plagiarism_highlights=None, plagiarism_score=0):
    """
    AI detection: simple chunking, no overlap.
    """
    plagiarism_score = plagiarism_score or 0
    if len(text) < 300:
        return {'score': 0.0, 'highlights': []}

    # initialize once
    if not hasattr(check_ai_probability, 'detector'):
        check_ai_probability.detector = pipeline(
            'text-classification',
            model='Hello-SimpleAI/chatgpt-detector-roberta',
            truncation=True,
            max_length=512,
            device= 0 if torch.cuda.is_available() else -1
        )

    chunk_size = 512
    preds = []
    for i in range(0, len(text), chunk_size):
        chunk = text[i:i+chunk_size]
        if len(chunk) < 100:
            continue
        preds.append((i, check_ai_probability.detector(chunk)[0]))

    scores = []
    highlights = []
    for idx, pred in preds:
        lbl = pred['label']
        sc = pred['score'] * 100
        # if label is AI, we take sc; if HUMAN, we take (100 - sc)
        val = sc if lbl == 'AI' else (100 - sc)
        scores.append(val)
        if lbl == 'AI':
            highlights.append({
                'type': 'ai',
                'position': calculate_position(text, idx, idx + chunk_size)
            })

    avg = round(sum(scores) / len(scores), 1) if scores else 0.0
    # caping so that plagiarism + ai ≤ 100
    cap = max(0.0, 100.0 - plagiarism_score)
    return {
        'score': min(avg, cap),
        'highlights': highlights
    }


def calculate_position(full_text, start, end):
    """Return percentage-based box for front-end."""
    total = len(full_text)
    return {
        'page': 1,
        'x': round(start / total * 100, 2),
        'y': 0,  # not used
        'width': round((end - start) / total * 100, 2),
        'height': 2
    }


def calculate_document_stats(text):
    """Word count, char count, pages, reading time (mins)."""
    words = len(text.split())
    chars = len(text)
    pages = max(1, (chars // 1500) + 1)
    try:
        read = textstat.reading_time(text, ms_per_char=14.69)
    except Exception:
        read = max(1, words // 200)
    return {
        'word_count': words,
        'character_count': chars,
        'page_count': pages,
        'reading_time': read
    }

# def check_ai_probability(text):
#     """Return AI detection with sentence positions"""
#     if not AI_MODEL:
#         return {'score': 0, 'highlights': []}
    
#     text = (text or "").strip()
#     if not text:
#         return {'score': 0, 'highlights': []}

#     try:
#         sentences = re.split(r'(?<=[.!?]) +', text)
#         highlights = []
#         total_score = 0
#         detected = 0
        
#         for sentence in sentences:
#             if not sentence.strip():
#                 continue
                
#             result = AI_MODEL(sentence[:512])[0]
            
#             if result['label'] == 'AI' and result['score'] > 0.7:
#                 start = text.find(sentence)
#                 if start != -1:
#                     highlights.append({
#                         'type': 'ai',
#                         'position': calculate_position(text, start, start + len(sentence))
#                     })
#                     total_score += result['score']
#                     detected += 1

#         avg_score = (total_score / detected * 100) if detected > 0 else 0
        
#         return {
#             'score': round(avg_score, 2),
#             'highlights': highlights
#         }

#     except Exception as e:
#         logger.error(f"AI detection error: {str(e)}")
#         return {'score': 0, 'highlights': []}
# def check_ai_probability(text):

# def analyze_text(content_hash,text):
#     """Analyze text for plagiarism using TF-IDF and cosine similarity"""
#     existing_docs = Document.objects.exclude(content_hash=content_hash).values_list('content', flat=True)
    
#     # Handle empty document database
#     if not existing_docs:
#         return {
#             'score': 0.0,
#             'matches': [],
#             'highlighted': text
#         }

#     vectorizer = TfidfVectorizer(stop_words='english')
#     vectors = vectorizer.fit_transform([text] + list(existing_docs))
    
#     similarity_matrix = cosine_similarity(vectors[0:1], vectors[1:])
#     similarities = similarity_matrix[0]
    
#     matches = []
#     for idx, score in enumerate(similarities):
#         if score > 0.2:  
#             doc = Document.objects.all()[idx]
#             matches.append({
#                 'source': doc.file.name,
#                 'similarity': round(score * 100, 2),
#                 'url': f"/documents/{doc.id}/"  
#             })
    
#     return {
#         'score': round(max(similarities, default=0) * 100, 2),
#         'matches': sorted(matches, key=lambda x: x['similarity'], reverse=True),
#         'highlighted': highlight_matches(text, existing_docs)
#     }

# # def check_ai_probability(text):
# #     """Lightweight AI detection using a faster model"""
# #     try:
#     print("AI detection started")
#     """Lightweight AI detection using a faster model"""
#     # return {'score': 0, 'highlights': []}
#     try:
#         # Enhanced validation
#         if not text or len(re.findall(r'\w+', text)) < 3:  # At least 3 words
#             return {'score': 0, 'highlights': []}
#         if not hasattr(check_ai_probability, 'ai_detector'):
#             check_ai_probability.ai_detector = pipeline(
#                 'text-classification', 
#                 model='Hello-SimpleAI/chatgpt-detector-roberta',
#                 truncation=True,
#                 max_length=512,
#                 device=0 if torch.cuda.is_available() else -1
#             )

#         processed_text = text[:1024].strip()
        
#         # Final safety check
#         if not processed_text or len(processed_text) < 10:
#             return {'score': 0, 'highlights': []}

#         result = check_ai_probability.ai_detector(processed_text)
        
#         # Handle empty results
#         if not result:
#             return {'score': 0, 'highlights': []}
            
#         return {
#             'score': round(result[0]['score'] * 100, 2),
#             'highlights': []  # Add your highlight logic here
#         }
        
#     except ValueError as ve:
#         if "0 sample(s)" in str(ve):
#             return {'score': 0, 'highlights': []}
#         raise
#     except Exception as e:
#         print(f"AI Detection Error: {str(e)}")
#         return {'score': 0, 'highlights': []}
# #         # Use a smaller distilled model
# #         ai_detector = pipeline(
# #             'text-classification', 
# #             model='Hello-SimpleAI/chatgpt-detector-roberta',
# #             truncation=True,
# #             max_length=512,
# #             device=0 if torch.cuda.is_available() else -1  # Use GPU if available
# #         )
        
# #         # Process first 1024 characters only for speed
# #         result = ai_detector(text[:1024])
# #         return round(result[0]['score'] * 100, 2)
# #     except Exception as e:
# #         print(f"AI Detection Error: {str(e)}")
# #         return 0.0
    
    
# def check_ai_probability(text):
#     """AI detection with proper resource management"""
#     try:
#         if not torch.cuda.is_available():
#             print("Warning: Using CPU for AI detection - this will be slow!")

#         # Use smaller model for better performance
#         ai_detector = pipeline(
#             'text-classification',
#             model='distilbert-base-uncased',  # Lighter model
#             device=0 if torch.cuda.is_available() else -1,
#             truncation=True,
#             max_length=512
#         )

#         # Process first 512 characters only
#         result = ai_detector(text[:512])
#         return round(result[0]['score'] * 100, 2)
        
#     except Exception as e:
#         print(f"AI Detection Failed: {str(e)}")
#         return 0.0  # Return safe default    
    