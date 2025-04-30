from django.apps import AppConfig


class DocumentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'documents'
    def ready(self):
        import nltk
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt', download_dir='/home/tnqn/nltk_data')  # Explicit path
            nltk.data.path.append('/home/tnqn/nltk_data')
        