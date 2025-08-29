from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Sum, Q
from django.db.models.functions import TruncMonth, TruncYear
from django.utils import timezone
from datetime import timedelta, datetime
import json

from .models.Analista_model import Analista
from .models.Apiario_model import Apiario
from .models.Apicultor_model import Apicultor
from .models.MuestraTambor_model import MuestraTambor
from .models.TamborApiario_model import TamborApiario
from .models.Especie_model import Especie
from .models.Pool_model import Pool
from .models.ContienePool_model import ContienePool
from .models.AnalisisPalinologico_model import AnalisisPalinologico
from .models.AnalisisFisicoQuimico_model import AnalisisFisicoQuimico


from .serializers import (
    ApicultorSerializer, AnalistaSerializer, ApiarioSerializer,
    TamborSerializer, TamborApiarioSerializer, EspecieSerializer,
    PoolSerializer, MuestraTamborSerializer, AnalisisPalinologicoSerializer,
    AnalisisFisicoQuimicoSerializer, ApiarioDetailSerializer,
    MuestraDetailSerializer, AnalisisPalinologicoDetailSerializer,
    AnalisisFisicoQuimicoDetailSerializer, EstadisticasSerializer,
    ContienePoolSerializer,
    TamborWithApiariosSerializer
)

class ApicultorViewSet(viewsets.ModelViewSet):
    queryset = Apicultor.objects.all()
    serializer_class = ApicultorSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'])
    def apiarios(self, request, pk=None):
        apicultor = self.get_object()
        apiarios = Apiario.objects.filter(apicultor=apicultor)
        serializer = ApiarioSerializer(apiarios, many=True)
        return Response(serializer.data)

class AnalistaViewSet(viewsets.ModelViewSet):
    queryset = Analista.objects.all()
    serializer_class = AnalistaSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'])
    def muestras(self, request, pk=None):
        analista = self.get_object()
        muestras = Pool.objects.filter(analista=analista)
        serializer = PoolSerializer(muestras, many=True)
        return Response(serializer.data)

class ApiarioViewSet(viewsets.ModelViewSet):
    queryset = Apiario.objects.all()
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ApiarioDetailSerializer
        return ApiarioSerializer

    @action(detail=True, methods=['get'])
    def tambores(self, request, pk=None):
        apiario = self.get_object()
        tambores = MuestraTambor.objects.filter(apiarios=apiario)
        serializer = MuestraTamborSerializer(tambores, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def estadisticas(self, request, pk=None):
        apiario = self.get_object()
        
        # Estadísticas del apiario
        stats = {
            'total_tambores': apiario.tambores.count(),
            'total_muestras': Pool.objects.filter(tambores__apiarios=apiario).distinct().count(),
            'analisis_palinologicos': AnalisisPalinologico.objects.filter(
                pool__tambores__apiarios=apiario
            ).distinct().count(),

            'especies_encontradas': Especie.objects.filter(
                analisis_palinologicos__pool__tambores__apiarios=apiario
            ).distinct().count()
        }

        # Análisis físico-químicos del apiario
        analisis_fq = AnalisisFisicoQuimico.objects.filter(
            tambor__apiarios=apiario
        ).aggregate(
            promedio_humedad=Avg('humedad'),
            promedio_color=Avg('color')
        )

        stats.update(analisis_fq)

        return Response(stats)

class TamborViewSet(viewsets.ModelViewSet):
    queryset = MuestraTambor.objects.all()
    serializer_class = TamborWithApiariosSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = MuestraTambor.objects.all()
        # Filtrar por tambores disponibles si se especifica el parámetro
        disponibles = self.request.query_params.get('disponibles', None)
        if disponibles == 'true':
            queryset = queryset.filter(estado_analisis_palinologico=False)
        return queryset

    @action(detail=True, methods=['get'])
    def muestras(self, request, pk=None):
        tambor = self.get_object()
        muestras = Pool.objects.filter(tambores=tambor)
        serializer = PoolSerializer(muestras, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def liberar(self, request, pk=None):
        """Liberar un tambor para que esté disponible nuevamente"""
        tambor = self.get_object()
        tambor.estado_analisis_palinologico = False
        tambor.save()
        serializer = self.get_serializer(tambor)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def liberar_multiple(self, request):
        """Liberar múltiples tambores a la vez"""
        tambor_ids = request.data.get('tambor_ids', [])
        MuestraTambor.objects.filter(id__in=tambor_ids).update(estado_analisis_palinologico=False)
        return Response({'message': f'{len(tambor_ids)} tambores liberados exitosamente'})

class EspecieViewSet(viewsets.ModelViewSet):
    queryset = Especie.objects.all()
    serializer_class = EspecieSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'])
    def analisis_palinologicos(self, request, pk=None):
        especie = self.get_object()
        analisis = AnalisisPalinologico.objects.filter(especie=especie)
        serializer = AnalisisPalinologicoSerializer(analisis, many=True)
        return Response(serializer.data)

class MuestraViewSet(viewsets.ModelViewSet):
    queryset = Pool.objects.all()
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MuestraDetailSerializer
        return PoolSerializer

    @action(detail=True, methods=['get'])
    def estadisticas(self, request, pk=None):
        muestra = self.get_object()
        
        # Estadísticas de la muestra
        stats = {
            'total_analisis_palinologicos': muestra.analisis_palinologicos.count(),
            'especies_encontradas': muestra.analisis_palinologicos.values(
                'especie__nombre_cientifico'
            ).annotate(
                total_granos=Sum('cantidad_granos'),
                porcentaje=Avg('porcentaje')
            )
        }

        return Response(stats)

class AnalisisPalinologicoViewSet(viewsets.ModelViewSet):
    queryset = AnalisisPalinologico.objects.all()
    permission_classes = [permissions.AllowAny]
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return AnalisisPalinologicoDetailSerializer
        return AnalisisPalinologicoSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        pool_id = self.request.query_params.get('pool')
        if pool_id:
            return queryset.filter(pool=pool_id)
        return queryset
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def resumen_especies(self, request):
        # Resumen de especies más comunes
        especies = Especie.objects.annotate(
            total_analisis=Count('analisis_palinologicos'),
            total_granos=Sum('analisis_palinologicos__cantidad_granos')
        ).order_by('-total_analisis')[:10]

        return Response([{
            'especie': especie.nombre_cientifico,
            'total_analisis': especie.total_analisis,
            'total_granos': especie.total_granos
        } for especie in especies])

class AnalisisFisicoQuimicoViewSet(viewsets.ModelViewSet):
    queryset = AnalisisFisicoQuimico.objects.all()
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AnalisisFisicoQuimicoDetailSerializer
        return AnalisisFisicoQuimicoSerializer

    @action(detail=True, methods=['get'])
    def tambor(self, request, pk=None):
        analisis = self.get_object()
        serializer = TamborSerializer(analisis.tambor)
        return Response(serializer.data)

class EstadisticasView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EstadisticasSerializer

    def get(self, request):
        # Obtener estadísticas generales
        stats = {
            'total_apicultores': Apicultor.objects.count(),
            'total_apiarios': Apiario.objects.count(),
            'total_tambores': MuestraTambor.objects.count(),
            'total_muestras': Pool.objects.count(),
            'total_analisis': {
                'palinologicos': AnalisisPalinologico.objects.count(),
                'fisicoquimicos': AnalisisFisicoQuimico.objects.count()
            }
        }

        # Estadísticas de muestras por mes
        # Eliminar estadísticas por fecha_extraccion del Pool, ya que ahora es atributo del tambor
        muestras_por_mes = []

        # Estadísticas de análisis por especie
        analisis_por_especie = AnalisisPalinologico.objects.values(
            'especie__nombre_cientifico'
        ).annotate(
            total=Count('id'),
            promedio_granos=Avg('cantidad_granos')
        ).order_by('-total')[:10]

        # Estadísticas de humedad por apiario
        humedad_por_apiario = AnalisisFisicoQuimico.objects.values(
            'tambor__apiarios__nombre_apiario'
        ).annotate(
            promedio_humedad=Avg('humedad')
        ).order_by('-promedio_humedad')

        # Estadísticas de los últimos 30 días
        fecha_limite = timezone.now() - timedelta(days=30)
        stats['ultimos_30_dias'] = {
            'muestras_nuevas': Pool.objects.filter(
                created_at__gte=fecha_limite
            ).count(),
            'analisis_nuevos': {
                'palinologicos': AnalisisPalinologico.objects.filter(
                    created_at__gte=fecha_limite
                ).count(),
                'fisicoquimicos': AnalisisFisicoQuimico.objects.filter(
                    created_at__gte=fecha_limite
                ).count()
            }
        }

        return Response({
            'estadisticas_generales': stats,
            'muestras_por_mes': list(muestras_por_mes),
            'analisis_por_especie': list(analisis_por_especie),
            'humedad_por_apiario': list(humedad_por_apiario)
        }) 
        
class ContadorView(APIView):
    """Vista para el contador de muestras"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Obtener el contador de muestras"""
        contador = Pool.objects.count()
        return Response({'contador': contador})

    def post(self, request):
        """Crear una nueva muestra"""
        serializer = PoolSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContienePoolViewSet(viewsets.ModelViewSet):
    queryset = ContienePool.objects.all()
    serializer_class = ContienePoolSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'])
    def pool(self, request, pk=None):
        contiene_pool = self.get_object()
        serializer = PoolSerializer(contiene_pool.pool)
        return Response(serializer.data)

class TamborApiarioViewSet(viewsets.ModelViewSet):
    queryset = TamborApiario.objects.all()
    serializer_class = TamborApiarioSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'])
    def apiario(self, request, pk=None):
        tambor_apiario = self.get_object()
        serializer = ApiarioSerializer(tambor_apiario.apiario)

class PoolViewSet(viewsets.ModelViewSet):
    queryset = Pool.objects.all()
    serializer_class = PoolSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Pool.objects.select_related('analista').all()
        return queryset

    @action(detail=True, methods=['get'])
    def estadisticas(self, request, pk=None):
        """Obtener estadísticas de un pool específico"""
        from .services import get_pool_stats_response
        return get_pool_stats_response(pk)

def pool_stats(request, pool_id):
    """
    Obtiene estadísticas de un pool específico para visualizaciones
    Retorna datos para: gráfico de torta, barras y scatter plot
    """
    from .services import get_pool_stats_response
    return get_pool_stats_response(pool_id)


# Health check endpoint para AWS ALB
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def health_check(request):
    """Endpoint de health check para AWS Application Load Balancer"""
    return JsonResponse({
        "status": "healthy", 
        "service": "apicola_lab",
        "timestamp": timezone.now().isoformat()
    })