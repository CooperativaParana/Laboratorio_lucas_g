from django.db import models
from modelos.models.Apiario_model import Apiario


class MuestraTambor(models.Model):
    """Modelo para los tambores de miel"""
    num_registro = models.CharField(max_length=50, unique=True)
    estado_analisis_palinologico = models.BooleanField(
        default=False, 
        help_text="True si el tambor está asignado a un grupo de análisis, False si está disponible"
    )
    fecha_de_extraccion = models.DateField(null=True, blank=True)
    apiarios = models.ManyToManyField(
        Apiario, 
        through='TamborApiario',
        related_name='tambores'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'muestra_tambor'
        verbose_name = 'MuestraTambor'
        verbose_name_plural = 'MuestrasTambores'

    def __str__(self):
        return f"MuestraTambor {self.num_registro}"

