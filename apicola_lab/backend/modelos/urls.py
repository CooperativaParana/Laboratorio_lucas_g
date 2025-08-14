from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ApicultorViewSet, AnalistaViewSet, ApiarioViewSet,
    TamborViewSet, EspecieViewSet, MuestraViewSet,
    AnalisisPalinologicoViewSet, AnalisisFisicoQuimicoViewSet,
    EstadisticasView, ContienePoolViewSet, TamborApiarioViewSet,
    PoolViewSet, pool_stats
)

router = DefaultRouter()
router.register(r'apicultores', ApicultorViewSet)
router.register(r'analistas', AnalistaViewSet)
router.register(r'apiarios', ApiarioViewSet)
router.register(r'tambores', TamborViewSet)
router.register(r'especies', EspecieViewSet)
router.register(r'muestras', MuestraViewSet)
router.register(r'analisis-palinologicos', AnalisisPalinologicoViewSet)
router.register(r'analisis-fisicoquimicos', AnalisisFisicoQuimicoViewSet)
router.register(r'pools', PoolViewSet)
router.register(r'contiene-pool', ContienePoolViewSet)
router.register(r'tambor-apiario', TamborApiarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('estadisticas/', EstadisticasView.as_view(), name='estadisticas'),
    path('pool/<int:pool_id>/stats/', pool_stats, name='pool_stats'),
] 