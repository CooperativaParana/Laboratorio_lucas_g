from django.db import models
from .models import Apicultor
from .models import Analista, AnalistaManager
from .models import Apiario
from .models import Tambor
from .models import TamborApiario
from .models import Especie
from .models import Muestra
from .models import MuestraTambor
from .models import AnalisisPalinologico
from .models import AnalisisFisicoQuimico

__all__ = [
    'Apicultor',
    'Analista',
    'AnalistaManager',
    'Apiario',
    'Tambor',
    'TamborApiario',
    'Especie',
    'Muestra',
    'MuestraTambor',
    'AnalisisPalinologico',
    'AnalisisFisicoQuimico'
]

