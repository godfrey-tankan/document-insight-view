# documents/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalyzeDocumentView, DocumentViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
    
    # Document Analysis Endpoint
    path('analyze/', AnalyzeDocumentView.as_view(), name='analyze-document'),
    
]