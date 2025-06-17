from django.apps import apps

def get_model(model_name):
    return apps.get_model('modelos', model_name)

__all__ = [
    'Apicultor_model',
    'Analista_model',
    'Apiario_model',
    'Tambor_model',
    'TamborApiario_model',
    'Especie_model',
    'Muestra_model',
    'MuestraTambor_model',
    'AnalisisPalinologico_model',
    'AnalisisFisicoQuimico_model'
]
