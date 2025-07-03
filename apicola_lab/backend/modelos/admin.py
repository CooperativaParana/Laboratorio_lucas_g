from django.contrib import admin
from .models.Analista_model import Analista
from .models.Pool_model import Pool
from .models.Especie_model import Especie
from .models.MuestraTambor_model import MuestraTambor
from .models.ContienePool_model import ContienePool
from .models.AnalisisPalinologico_model import AnalisisPalinologico
from .models.AnalisisFisicoQuimico_model import AnalisisFisicoQuimico

admin.site.register(Analista)
admin.site.register(Pool)
admin.site.register(Especie)
admin.site.register(MuestraTambor)
admin.site.register(ContienePool)
admin.site.register(AnalisisPalinologico)
admin.site.register(AnalisisFisicoQuimico) 