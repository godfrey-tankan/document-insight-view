# documents/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Document(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    plagiarism_score = models.FloatField()
    ai_score = models.FloatField()
    content_hash= models.CharField(max_length=64, unique=True)
    file = models.FileField(upload_to='documents/')
    created_at = models.DateTimeField(auto_now_add=True)
    word_count = models.IntegerField()
    character_count = models.IntegerField()
    page_count = models.IntegerField()
    reading_time = models.IntegerField()