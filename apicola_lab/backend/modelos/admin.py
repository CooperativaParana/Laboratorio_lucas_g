from django.contrib import admin
from .models import (
    Apicultor, Analista, Apiario, Tambor, TamborApiario, Especie, Muestra, MuestraTambor,
    AnalisisPalinologico, AnalisisFisicoQuimico
)

# Aquí se registrarán los modelos generados con inspectdb
# Ejemplo:
# from .models import TuModelo
# admin.site.register(TuModelo) 

admin.site.register(Apicultor)
admin.site.register(Analista)
admin.site.register(Apiario)
admin.site.register(Tambor)
admin.site.register(TamborApiario)
admin.site.register(Especie)
admin.site.register(Muestra)
admin.site.register(MuestraTambor)
admin.site.register(AnalisisPalinologico)
admin.site.register(AnalisisFisicoQuimico) 