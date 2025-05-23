# documents/serializers.py
from rest_framework import serializers
from .models import Document
from django.urls import reverse

class DocumentStatsSerializer(serializers.Serializer):
    word_count = serializers.IntegerField(source='word_count')
    character_count = serializers.IntegerField(source='character_count')
    page_count = serializers.IntegerField(source='page_count')
    reading_time = serializers.IntegerField(source='reading_time')

class AIMarkerSerializer(serializers.Serializer):
    type = serializers.CharField()
    confidence = serializers.FloatField()
    sections = serializers.ListField(child=serializers.CharField())

class SourceMatchSerializer(serializers.Serializer):
    source = serializers.CharField()
    url = serializers.URLField()
    match_percentage = serializers.FloatField()
    snippets = serializers.ListField(child=serializers.CharField())

class TextAnalysisSerializer(serializers.Serializer):
    original_content = serializers.FloatField()
    plagiarized_content = serializers.FloatField()
    ai_generated_content = serializers.FloatField()

class DocumentSerializer(serializers.ModelSerializer):
    fileUrl = serializers.SerializerMethodField()
    highlights = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = '__all__'

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_format(self, obj):
        if obj.file:
            return obj.file.name.split('.')[-1].lower()
        return 'unknown'