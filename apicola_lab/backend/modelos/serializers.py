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

class PoolDetailSerializer(serializers.ModelSerializer):
    analista = AnalistaSerializer(read_only=True)
    
    class Meta:
        model = Pool
        fields = ['id', 'analista', 'fecha_analisis', 'num_registro', 'observaciones', 'created_at', 'updated_at']

class MuestraTamborSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuestraTambor
        fields = '__all__'

class AnalisisPalinologicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalisisPalinologico
        fields = ['id', 'pool', 'especie', 'cantidad_granos', 'marca_especial', 'porcentaje', 'created_at', 'updated_at']
    
    def validate_marca_especial(self, value):
        """Validar que la marca especial sea válida o esté vacía"""
        if value is not None and value.strip() == '':
            return None
        return value
    
    def validate(self, data):
        """Validación personalizada para el serializer"""
        # Si es una actualización, no requerir pool y especie
        if self.instance:
            return data
        
        # Para creación, validar que pool y especie estén presentes
        if 'pool' not in data:
            raise serializers.ValidationError("El campo 'pool' es requerido para crear un análisis.")
        if 'especie' not in data:
            raise serializers.ValidationError("El campo 'especie' es requerido para crear un análisis.")
        
        return data
    
    def update(self, instance, validated_data):
        # Permitir actualización parcial
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

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
        fields = ['id', 'analista', 'tambores', 'fecha_analisis', 'num_registro', 'observaciones', 'created_at', 'updated_at']

class AnalisisPalinologicoDetailSerializer(serializers.ModelSerializer):
    pool = PoolDetailSerializer(read_only=True)
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
        fields = ['id', 'num_registro', 'fecha_de_extraccion', 'estado_analisis_palinologico', 'apiarios']