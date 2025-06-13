from django.contrib import admin
from django.apps import apps

# Registrar todos los modelos de la aplicación
for model in apps.get_app_config('modelos').get_models():
    admin.site.register(model) 