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
from rest_framework_simplejwt.tokens import AccessToken

@method_decorator(csrf_exempt, name='dispatch')
class AnalyzeDocumentView(APIView):
    

    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ1Nzc4OTAyLCJpYXQiOjE3NDU3Nzg2MDIsImp0aSI6ImNmNmVmYjRiNjkzMzRjZjI4OGRmZWIwMjQ3NzFiZTllIiwidXNlcl9pZCI6MX0.lI-Pz3yWoVALhTPaoyXcbiE6V1593LknCYGoPFOR-t0"
    try:
        decoded = AccessToken(token)
        print(decoded.payload)  # Check expiration (exp) and user_id
    except Exception as e:
        print("Invalid token:", e)
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
            plagiarism_result = analyze_text(text)
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
                'plagiarism': {
                    'score': plagiarism_result['score'],
                    'matches': plagiarism_result['matches']
                },
                'ai': {
                    'score': ai_probability,
                    'is_generated': ai_probability > 70
                },
                'highlighted_text': plagiarism_result['highlighted'],
                'document_stats': stats
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
        """Handle regular document creation"""
        file = self.request.FILES.get('file')
        if file:
            text = extract_text_from_file(file)
            stats = calculate_document_stats(text)
            serializer.save(
                user=self.request.user,
                content=text,
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