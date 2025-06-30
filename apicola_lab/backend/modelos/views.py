from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Sum
from django.db.models.functions import TruncMonth, TruncYear
from django.utils import timezone
from datetime import timedelta

from .models.Analista_model import Analista
from .models.Apiario_model import Apiario
from .models.Apicultor_model import Apicultor
from .models.Tambor_model import Tambor
from .models.TamborApiario_model import TamborApiario
from .models.Especie_model import Especie
from .models.Muestra_model import Muestra
from .models.MuestraTambor_model import MuestraTambor
from .models.AnalisisPalinologico_model import AnalisisPalinologico
from .models.AnalisisFisicoQuimico_model import AnalisisFisicoQuimico


from .serializers import (
    ApicultorSerializer, AnalistaSerializer, ApiarioSerializer,
    TamborSerializer, TamborApiarioSerializer, EspecieSerializer,
    MuestraSerializer, MuestraTamborSerializer, AnalisisPalinologicoSerializer,
    AnalisisFisicoQuimicoSerializer, ApiarioDetailSerializer,
    MuestraDetailSerializer, AnalisisPalinologicoDetailSerializer,
    AnalisisFisicoQuimicoDetailSerializer, EstadisticasSerializer
)

class ApicultorViewSet(viewsets.ModelViewSet):
    queryset = Apicultor.objects.all()
    serializer_class = ApicultorSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def apiarios(self, request, pk=None):
        apicultor = self.get_object()
        apiarios = Apiario.objects.filter(apicultor=apicultor)
        serializer = ApiarioSerializer(apiarios, many=True)
        return Response(serializer.data)

class AnalistaViewSet(viewsets.ModelViewSet):
    queryset = Analista.objects.all()
    serializer_class = AnalistaSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def muestras(self, request, pk=None):
        analista = self.get_object()
        muestras = Muestra.objects.filter(analista=analista)
        serializer = MuestraSerializer(muestras, many=True)
        return Response(serializer.data)

class ApiarioViewSet(viewsets.ModelViewSet):
    queryset = Apiario.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ApiarioDetailSerializer
        return ApiarioSerializer

    @action(detail=True, methods=['get'])
    def tambores(self, request, pk=None):
        apiario = self.get_object()
        tambores = Tambor.objects.filter(apiarios=apiario)
        serializer = TamborSerializer(tambores, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def estadisticas(self, request, pk=None):
        apiario = self.get_object()
        
        # Estadísticas del apiario
        stats = {
            'total_tambores': apiario.tambores.count(),
            'total_muestras': Muestra.objects.filter(tambores__apiarios=apiario).distinct().count(),
            'analisis_palinologicos': AnalisisPalinologico.objects.filter(
                muestra__tambores__apiarios=apiario
            ).distinct().count(),

            'especies_encontradas': Especie.objects.filter(
                analisis_palinologicos__muestra__tambores__apiarios=apiario
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
    queryset = Tambor.objects.all()
    serializer_class = TamborSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def muestras(self, request, pk=None):
        tambor = self.get_object()
        muestras = Muestra.objects.filter(tambores=tambor)
        serializer = MuestraSerializer(muestras, many=True)
        return Response(serializer.data)

class EspecieViewSet(viewsets.ModelViewSet):
    queryset = Especie.objects.all()
    serializer_class = EspecieSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def analisis_palinologicos(self, request, pk=None):
        especie = self.get_object()
        analisis = AnalisisPalinologico.objects.filter(especie=especie)
        serializer = AnalisisPalinologicoSerializer(analisis, many=True)
        return Response(serializer.data)

class MuestraViewSet(viewsets.ModelViewSet):
    queryset = Muestra.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MuestraDetailSerializer
        return MuestraSerializer

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
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AnalisisPalinologicoDetailSerializer
        return AnalisisPalinologicoSerializer

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
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EstadisticasSerializer

    def get(self, request):
        # Obtener estadísticas generales
        stats = {
            'total_apicultores': Apicultor.objects.count(),
            'total_apiarios': Apiario.objects.count(),
            'total_tambores': Tambor.objects.count(),
            'total_muestras': Muestra.objects.count(),
            'total_analisis': {
                'palinologicos': AnalisisPalinologico.objects.count(),
                'fisicoquimicos': AnalisisFisicoQuimico.objects.count()
            }
        }

        # Estadísticas de muestras por mes
        muestras_por_mes = Muestra.objects.annotate(
            mes=TruncMonth('fecha_extraccion')
        ).values('mes').annotate(
            total=Count('id')
        ).order_by('mes')

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
            'muestras_nuevas': Muestra.objects.filter(
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
        contador = Muestra.objects.count()
        return Response({'contador': contador})

    def post(self, request):
        """Crear una nueva muestra"""
        serializer = MuestraSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    