# documents/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalyzeDocumentView, DocumentViewSet
from django.conf import settings
from django.conf.urls.static import static



router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
    
    # Document Analysis Endpoint
    path('analyze/', AnalyzeDocumentView.as_view(), name='analyze-document'),
    
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)