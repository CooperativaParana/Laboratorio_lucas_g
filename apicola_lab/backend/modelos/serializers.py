from rest_framework import serializers
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

class ApicultorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apicultor
        fields = '__all__'

class AnalistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analista
        fields = ['id', 'nombres', 'apellidos', 'contacto', 'username', 'email', 'is_active']
        read_only_fields = ['is_active']

class ApiarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apiario
        fields = '__all__'

class TamborSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tambor
        fields = '__all__'

class TamborApiarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = TamborApiario
        fields = '__all__'

class EspecieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especie
        fields = '__all__'

class MuestraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Muestra
        fields = '__all__'

class MuestraTamborSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuestraTambor
        fields = '__all__'

class AnalisisPalinologicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalisisPalinologico
        fields = '__all__'

class AnalisisFisicoQuimicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalisisFisicoQuimico
        fields = '__all__'

# Serializers anidados para relaciones
class ApiarioDetailSerializer(serializers.ModelSerializer):
    apicultor = ApicultorSerializer(read_only=True)
    
    class Meta:
        model = Apiario
        fields = '__all__'

class MuestraDetailSerializer(serializers.ModelSerializer):
    analista = AnalistaSerializer(read_only=True)
    tambores = TamborSerializer(many=True, read_only=True)
    
    class Meta:
        model = Muestra
        fields = '__all__'

class AnalisisPalinologicoDetailSerializer(serializers.ModelSerializer):
    muestra = MuestraSerializer(read_only=True)
    especie = EspecieSerializer(read_only=True)
    
    class Meta:
        model = AnalisisPalinologico
        fields = '__all__'

class AnalisisFisicoQuimicoDetailSerializer(serializers.ModelSerializer):
    analista = AnalistaSerializer(read_only=True)
    tambor = TamborSerializer(read_only=True)
    
    class Meta:
        model = AnalisisFisicoQuimico
        fields = '__all__' 

class EstadisticasSerializer(serializers.Serializer):
    estadisticas_generales = serializers.DictField()

    muestras_por_mes = serializers.ListField(
        child=serializers.DictField()
    )

    analisis_por_especie = serializers.ListField(
        child=serializers.DictField()
    )

    humedad_por_apiario = serializers.ListField(
        child=serializers.DictField()
    )
