from django.db import models
from django.utils import timezone
from modelos.models import Analista, Tambor


class Muestra(models.Model):
    """Modelo para las muestras de miel"""
    analista = models.ForeignKey(
        Analista, 
        on_delete=models.RESTRICT,
        related_name='muestras',
        db_column='id_analista'
    )
    tambores = models.ManyToManyField(
        Tambor,
        through='MuestraTambor',
        related_name='muestras'
    )
    fecha_extraccion = models.DateField()
    fecha_analisis = models.DateField(null=True, blank=True)
    num_registro = models.CharField(max_length=50, unique=True, null=True, blank=True)
    observaciones = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'muestra'
        verbose_name = 'Muestra'
        verbose_name_plural = 'Muestras'
        indexes = [
            models.Index(fields=['analista'], name='idx_muestra_analista'),
            models.Index(fields=['fecha_extraccion', 'fecha_analisis'], name='idx_muestra_fechas'),
        ]

    def clean(self):
        """Validación personalizada para fechas"""
        from django.core.exceptions import ValidationError
        if self.fecha_analisis and self.fecha_extraccion:
            if self.fecha_analisis < self.fecha_extraccion:
                raise ValidationError(
                    'La fecha de análisis no puede ser anterior a la fecha de extracción'
                )

    def __str__(self):
        return f"Muestra {self.num_registro or self.id} - {self.fecha_extraccion}"