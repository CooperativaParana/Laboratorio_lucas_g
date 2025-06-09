from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import (
    Apicultor, Analista, Apiario, Tambor, TamborApiario,
    Especie, Muestra, MuestraTambor, AnalisisPalinologico,
    AnalisisFisicoQuimico
)
from .serializers import (
    ApicultorSerializer, AnalistaSerializer, ApiarioSerializer,
    TamborSerializer, TamborApiarioSerializer, EspecieSerializer,
    MuestraSerializer, MuestraTamborSerializer, AnalisisPalinologicoSerializer,
    AnalisisFisicoQuimicoSerializer, ApiarioDetailSerializer,
    MuestraDetailSerializer, AnalisisPalinologicoDetailSerializer,
    AnalisisFisicoQuimicoDetailSerializer
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
    def analisis_palinologicos(self, request, pk=None):
        muestra = self.get_object()
        analisis = AnalisisPalinologico.objects.filter(muestra=muestra)
        serializer = AnalisisPalinologicoDetailSerializer(analisis, many=True)
        return Response(serializer.data)

class AnalisisPalinologicoViewSet(viewsets.ModelViewSet):
    queryset = AnalisisPalinologico.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AnalisisPalinologicoDetailSerializer
        return AnalisisPalinologicoSerializer

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