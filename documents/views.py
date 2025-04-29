# documents/views.py
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from .models import Document
from .serializers import DocumentSerializer 
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from .utils import (
    extract_text_from_file,
    analyze_text,
    check_ai_probability,
    calculate_document_stats
)
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import hashlib

def calculate_content_hash(text):
    return hashlib.md5(text.encode()).hexdigest()

# documents/views.py
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Document
from .utils import (
    extract_text_from_file,
    analyze_text,
    check_ai_probability,
    calculate_document_stats
)
import hashlib

method_decorator(csrf_exempt, name='dispatch')
class AnalyzeDocumentView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('document')
        if not file:
            return Response({"error": "No document provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            text = extract_text_from_file(file)
            content_hash = hashlib.md5(text.encode()).hexdigest()

            existing_doc = Document.objects.filter(
                content_hash=content_hash,
            ).first()

            if existing_doc:
                plagiarism_result = analyze_text(content_hash,text)
                existing_doc.plagiarism_score = plagiarism_result['score']
                existing_doc.ai_score = check_ai_probability(text)
                existing_doc.save()
            else:
                # For new documents
                plagiarism_result = analyze_text(content_hash,text)
                ai_probability = check_ai_probability(text)
                stats = calculate_document_stats(text)
                
                existing_doc = Document.objects.create(
                    user=request.user,
                    content=text,
                    content_hash=content_hash,
                    plagiarism_score=plagiarism_result['score'],
                    ai_score=ai_probability,
                    file=file,
                    **stats
                )

            result = {
                'textAnalysis': {
                    'originalContent': 100 - existing_doc.plagiarism_score,
                    'plagiarizedContent': existing_doc.plagiarism_score,
                    'aiGeneratedContent': existing_doc.ai_score
                },
                'plagiarismScore': existing_doc.plagiarism_score,
                'aiScore': existing_doc.ai_score,
                'highlightedText': plagiarism_result.get('highlighted', ''),
                'content': text,
                'documentStats': {
                    'wordCount': existing_doc.word_count,
                    'characterCount': existing_doc.character_count,
                    'pageCount': existing_doc.page_count,
                    'readingTime': existing_doc.reading_time
                },
                'sourcesDetected': plagiarism_result.get('matches', []),
                'aiMarkers': [
                    {
                        'type': 'AI Probability',
                        'confidence': existing_doc.ai_score,
                        'sections': []
                    }
                ]
            }
            
            return Response(result, status=status.HTTP_200_OK)

        except ValidationError as e:
            print(f"Validation Error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected Error: {str(e)}")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@method_decorator(csrf_exempt, name='dispatch')
class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        file = self.request.FILES.get('file')
        if file:
            text = extract_text_from_file(file)
            content_hash = calculate_content_hash(text)
            
            existing = Document.objects.filter(
                user=self.request.user,
                content_hash=content_hash
            ).first()

            if existing:
                # Update existing record
                existing.plagiarism_score = analyze_text(text, self.request.user)['score']
                existing.ai_score = check_ai_probability(text)
                existing.save()
                return

            stats = calculate_document_stats(text)
            serializer.save(
                user=self.request.user,
                content=text,
                content_hash=content_hash,
                **stats
            )


    @action(detail=False, methods=['get'], url_path='test-csrf')
    def test_csrf(self, request):
        """Test CSRF exemption"""

        return Response({"message": "CSRF exemption works!"}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='analyze')
    def analyze(self, request):
        print("Authenticated User:", request.user)
        """Custom analysis endpoint"""
        # Your existing analysis logic from AnalyzeDocumentView
        file = request.FILES.get('document')
        if not file:
            return Response({"error": "No document provided"}, status=400)
        
        text = extract_text_from_file(file)
        plagiarism_result = analyze_text(text)
        ai_probability = check_ai_probability(text)
        stats = calculate_document_stats(text)

        # Create and serialize document
        doc = Document.objects.create(
            user=request.user,
            content=text,
            plagiarism_score=plagiarism_result['score'],
            ai_score=ai_probability,
            file=file,
            **stats
        )
        
        serializer = self.get_serializer(doc)
        return Response(serializer.data, status=201)