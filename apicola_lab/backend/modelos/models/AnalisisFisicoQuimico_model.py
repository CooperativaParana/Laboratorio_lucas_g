from django.db import models
from modelos.models.Analista_model import Analista
from modelos.models.MuestraTambor_model import MuestraTambor


class AnalisisFisicoQuimico(models.Model):
    """Modelo para análisis físico-químicos"""
    analista = models.ForeignKey(
        Analista, 
        on_delete=models.RESTRICT,
        related_name='analisis_fisicoquimicos',
        db_column='id_analista'
    )
    tambor = models.ForeignKey(
        MuestraTambor, 
        on_delete=models.CASCADE,
        related_name='analisis_fisicoquimicos',
        db_column='id_tambor'
    )
    color = models.IntegerField(null=True, blank=True)
    humedad = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Porcentaje de humedad",
        db_column='Humedad'  # Manteniendo el nombre original de la columna
    )
    fecha_extraccion = models.DateField()
    fecha_analisis = models.DateField(null=True, blank=True)
    num_registro = models.CharField(max_length=50, unique=True, null=True, blank=True)
    observaciones = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'analisis_fisicoquimicos'
        verbose_name = 'Análisis Físico-Químico'
        verbose_name_plural = 'Análisis Físico-Químicos'

    def __str__(self):
        return f"Análisis F-Q {self.num_registro or self.id} - {self.tambor}" 