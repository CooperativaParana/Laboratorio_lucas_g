from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ApicultorViewSet, AnalistaViewSet, ApiarioViewSet,
    TamborViewSet, EspecieViewSet, MuestraViewSet,
    AnalisisPalinologicoViewSet, AnalisisFisicoQuimicoViewSet
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

urlpatterns = [
    path('', include(router.urls)),
] 