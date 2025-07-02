from django.db import models
from django.utils import timezone
from modelos.models.MuestraTambor_model import MuestraTambor
from modelos.models.Apiario_model import Apiario


class TamborApiario(models.Model):
    """Tabla intermedia para la relación Tambor-Apiario"""
    tambor = models.ForeignKey(
        MuestraTambor, 
        on_delete=models.CASCADE,
        db_column='id_tambor'
    )
    apiario = models.ForeignKey(
        Apiario, 
        on_delete=models.CASCADE,
        db_column='id_apiario'
    )
    fecha_asignacion = models.DateField(default=timezone.now)

    class Meta:
        db_table = 'tambor_apiario'
        unique_together = ('tambor', 'apiario')
        verbose_name = 'Asignación Tambor-Apiario'
        verbose_name_plural = 'Asignaciones Tambor-Apiario'

    def __str__(self):
        return f"{self.tambor} - {self.apiario}"    
