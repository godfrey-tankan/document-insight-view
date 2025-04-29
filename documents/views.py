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

@method_decorator(csrf_exempt, name='dispatch')
class AnalyzeDocumentView(APIView):
    

 
    authentication_classes = [JWTAuthentication]  # Add JWT authentication
    permission_classes = [IsAuthenticated]        # Require authenticated users

    def post(self, request):
        # Remove the manual authentication check
        # Get uploaded file
        file = request.FILES.get('document')
        if not file:
            return Response({"error": "No document provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Extract text from file
            text = extract_text_from_file(file)
            
            # Perform analysis
            plagiarism_result = analyze_text(request,text)
            ai_probability = check_ai_probability(text)
            stats = calculate_document_stats(text)
            
            # Save document to database
            doc = Document.objects.create(
                user=request.user,
                content=text,
                plagiarism_score=plagiarism_result['score'],
                ai_score=ai_probability,
                file=file,
                word_count=stats['word_count'],
                character_count=stats['character_count'],
                page_count=stats['page_count'],
                reading_time=stats['reading_time']
            )
            
            # Prepare response
            result = {
                    'textAnalysis': {
                        'originalContent': 100 - plagiarism_result['score'],
                        'plagiarizedContent': plagiarism_result['score'],
                        'aiGeneratedContent': ai_probability
                    },
                    'plagiarismScore': plagiarism_result['score'],
                    'aiScore': ai_probability,
                    'documentStats': {
                        'wordCount': stats['word_count'],
                        'characterCount': stats['character_count'],
                        'pageCount': stats['page_count'],
                        'readingTime': stats['reading_time']
                    },
                    'sourcesDetected': plagiarism_result['matches'],
                    'aiMarkers': [
                        {
                            'type': 'AI Probability',
                            'confidence': ai_probability,
                            'sections': []
                        }
                    ]
                }
            
            return Response(result, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
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