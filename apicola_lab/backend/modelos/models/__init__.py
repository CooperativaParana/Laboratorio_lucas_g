from django.apps import apps

def get_model(model_name):
    return apps.get_model('modelos', model_name)

__all__ = [
    'Apicultor',
    'Analista',
    'Apiario',
    'Tambor',
    'TamborApiario',
    'Especie',
    'Muestra',
    'MuestraTambor',
    'AnalisisPalinologico',
    'AnalisisFisicoQuimico'
]
