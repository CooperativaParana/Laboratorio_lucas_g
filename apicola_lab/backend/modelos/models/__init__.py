from .Apicultor_model import Apicultor
from .Analista_model import Analista
from .Apiario_model import Apiario
from .TamborApiario_model import TamborApiario
from .Especie_model import Especie
from .MuestraTambor_model import MuestraTambor
from .Pool_model import Pool
from .ContienePool_model import ContienePool
from .AnalisisPalinologico_model import AnalisisPalinologico
from .AnalisisFisicoQuimico_model import AnalisisFisicoQuimico

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
