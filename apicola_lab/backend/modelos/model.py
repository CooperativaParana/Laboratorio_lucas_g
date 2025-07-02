from django.db import models
from .models.Apicultor_model import Apicultor
from .models.Analista_model import Analista
from .models.AnalistaManager_model import AnalistaManager
from .models.Apiario_model import Apiario
from .models.MuestraTambor_model import MuestraTambor
from .models.TamborApiario_model import TamborApiario
from .models.Especie_model import Especie
from .models.Pool_model import Pool
from .models.ContienePool_model import ContienePool
from .models.AnalisisPalinologico_model import AnalisisPalinologico
from .models.AnalisisFisicoQuimico_model import AnalisisFisicoQuimico

__all__ = [
    'Apicultor',
    'Analista',
    'AnalistaManager',
    'Apiario',
    'MuestraTambor',
    'TamborApiario',
    'Especie',
    'Pool',
    'ContienePool',
    'AnalisisPalinologico',
    'AnalisisFisicoQuimico'
]

