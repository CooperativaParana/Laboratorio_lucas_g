from rest_framework import serializers
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
        model = MuestraTambor
        fields = '__all__'

class TamborApiarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = TamborApiario
        fields = '__all__'

class EspecieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especie
        fields = '__all__'

class PoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pool
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
    tambores = MuestraTamborSerializer(many=True, read_only=True)
    
    class Meta:
        model = Pool
        exclude = ['fecha_extraccion']

class AnalisisPalinologicoDetailSerializer(serializers.ModelSerializer):
    pool = PoolSerializer(read_only=True)
    especie = EspecieSerializer(read_only=True)
    
    class Meta:
        model = AnalisisPalinologico
        fields = '__all__'

class AnalisisFisicoQuimicoDetailSerializer(serializers.ModelSerializer):
    analista = AnalistaSerializer(read_only=True)
    tambor = MuestraTamborSerializer(read_only=True)
    
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

class ContienePoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContienePool
        fields = '__all__'

# --- Nuevo serializer para tambores con apiarios y apicultor anidados ---
class TamborWithApiariosSerializer(serializers.ModelSerializer):
    apiarios = ApiarioDetailSerializer(many=True, read_only=True)

    class Meta:
        model = MuestraTambor
        fields = ['id', 'num_registro', 'fecha_de_extraccion', 'apiarios']