from django.contrib import admin
from .models import Document

# Register your models here.

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id','user', 'content_hash')
    search_fields = ('user','content_hash')
    list_filter = ('created_at',)
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'