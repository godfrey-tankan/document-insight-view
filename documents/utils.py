# documents/utils.py
import PyPDF2
import docx
import re
import textstat
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline
from .models import Document  # Add this import

def extract_text_from_file(file):
    """Extract text from PDF, DOCX, or TXT files"""
    text = ""    
    print(f"\nStarting extraction for {file.name}")
    
    if file.name.endswith('.pdf'):
        try:
            # Read the file content into memory
            file_content = file.read()
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            
            for i, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text() or ''
                text += page_text
                print(f"Page {i+1} extracted {len(page_text)} characters")
                
            if len(text.strip()) < 50:
                raise ValueError("PDF appears to be image-based or empty")
                
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
    
    return text.strip()

def analyze_text(request,text):
    """Analyze text for plagiarism using TF-IDF and cosine similarity"""
    existing_docs = Document.objects.exclude(user=request.user).values_list('content', flat=True)
    
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
        if score > 0.2:  # Adjust threshold as needed
            doc = Document.objects.all()[idx]
            matches.append({
                'source': doc.file.name,
                'similarity': round(score * 100, 2),
                'url': f"/documents/{doc.id}/"  # Add actual URL logic
            })
    
    return {
        'score': round(max(similarities, default=0) * 100, 2),
        'matches': sorted(matches, key=lambda x: x['similarity'], reverse=True),
        'highlighted': highlight_matches(text, existing_docs)
    }

def check_ai_probability(text):
    """Lightweight AI detection using a faster model"""
    try:
        # Use a smaller distilled model
        ai_detector = pipeline(
            'text-classification', 
            model='Hello-SimpleAI/chatgpt-detector-roberta',
            truncation=True,
            max_length=512,
            device=0 if torch.cuda.is_available() else -1  # Use GPU if available
        )
        
        # Process first 1024 characters only for speed
        result = ai_detector(text[:1024])
        return round(result[0]['score'] * 100, 2)
    except Exception as e:
        print(f"AI Detection Error: {str(e)}")
        return 0.0
    
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