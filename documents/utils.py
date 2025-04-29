# documents/utils.py
import PyPDF2
import docx
import re
import textstat
import torch 
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline
from .models import Document
import io 
import logging
logger = logging.getLogger(__name__)

def extract_text_from_file(file):
    """Extract text with better error handling"""
    text = ""
    
    logger.info(f"Starting extraction for {file.name}")
    
    if file.name.endswith('.pdf'):
        try:
            file.seek(0)
            pdf_reader = PyPDF2.PdfReader(file)
            
            logger.info(f"PDF has {len(pdf_reader.pages)} pages")
            
            for i, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text() or ''
                text += page_text
                logger.debug(f"Page {i+1}: {len(page_text)} chars")
                
                if i > 10 and len(text) < 100:
                    raise ValueError("PDF appears to be image-based or empty")
            
            if len(text.strip()) < 50:
                raise ValueError("PDF contains less than 50 characters of text")
                
        except Exception as e:
            logger.error(f"PDF Error: {str(e)}")
            raise ValueError(f"Failed to extract text: {str(e)}")
        except Exception as e:
            print(f"PDF Error: {str(e)}")
            raise ValueError(f"Error reading PDF: {str(e)}")
            
    elif file.name.endswith('.docx'):
        try:
            doc = docx.Document(file)
            text = '\n'.join([para.text for para in doc.paragraphs])
        except Exception as e:
            raise ValueError(f"Error reading DOCX file: {str(e)}")

    elif file.name.endswith('.txt'):
        text = file.read().decode('utf-8')
    
    else:
        raise ValueError("Unsupported file format. Supported formats: PDF, DOCX, TXT")
    logger.info(f"Extracted {len(text)} characters total")
    return text.strip()


def analyze_text(content_hash,text):
    """Analyze text for plagiarism using TF-IDF and cosine similarity"""
    existing_docs = Document.objects.exclude(content_hash=content_hash).values_list('content', flat=True)
    
    # Handle empty document database
    if not existing_docs:
        return {
            'score': 0.0,
            'matches': [],
            'highlighted': text
        }

    vectorizer = TfidfVectorizer(stop_words='english')
    vectors = vectorizer.fit_transform([text] + list(existing_docs))
    
    similarity_matrix = cosine_similarity(vectors[0:1], vectors[1:])
    similarities = similarity_matrix[0]
    
    matches = []
    for idx, score in enumerate(similarities):
        if score > 0.2:  
            doc = Document.objects.all()[idx]
            matches.append({
                'source': doc.file.name,
                'similarity': round(score * 100, 2),
                'url': f"/documents/{doc.id}/"  
            })
    
    return {
        'score': round(max(similarities, default=0) * 100, 2),
        'matches': sorted(matches, key=lambda x: x['similarity'], reverse=True),
        'highlighted': highlight_matches(text, existing_docs)
    }

# def check_ai_probability(text):
#     """Lightweight AI detection using a faster model"""
#     try:
#         # Use a smaller distilled model
#         ai_detector = pipeline(
#             'text-classification', 
#             model='Hello-SimpleAI/chatgpt-detector-roberta',
#             truncation=True,
#             max_length=512,
#             device=0 if torch.cuda.is_available() else -1  # Use GPU if available
#         )
        
#         # Process first 1024 characters only for speed
#         result = ai_detector(text[:1024])
#         return round(result[0]['score'] * 100, 2)
#     except Exception as e:
#         print(f"AI Detection Error: {str(e)}")
#         return 0.0
    
    
def check_ai_probability(text):
    """AI detection with proper resource management"""
    try:
        if not torch.cuda.is_available():
            print("Warning: Using CPU for AI detection - this will be slow!")

        # Use smaller model for better performance
        ai_detector = pipeline(
            'text-classification',
            model='distilbert-base-uncased',  # Lighter model
            device=0 if torch.cuda.is_available() else -1,
            truncation=True,
            max_length=512
        )

        # Process first 512 characters only
        result = ai_detector(text[:512])
        return round(result[0]['score'] * 100, 2)
        
    except Exception as e:
        print(f"AI Detection Failed: {str(e)}")
        return 0.0  # Return safe default    
    

    
def highlight_matches(text, sources):
    """Highlight matching phrases in text"""
    patterns = []
    for src in sources:
        if len(src) > 50:
            # Find common phrases of 3-5 words
            phrases = re.findall(r'\b\w+\s\w+\s\w+\b', src[:500])
            patterns.extend(phrases)
    
    if patterns:
        unique_patterns = list(set(patterns))
        pattern_re = re.compile(r'(' + '|'.join(map(re.escape, unique_patterns)) + r')', re.IGNORECASE)
        return pattern_re.sub(r'<mark class="highlight">\1</mark>', text)
    return text

def calculate_document_stats(text):
    """Calculate document statistics"""
    return {
        'word_count': len(text.split()),
        'character_count': len(text),
        'page_count': (len(text) // 1500) + 1,  # Approximate pages
        'reading_time': textstat.reading_time(text, ms_per_char=14.69)
    }