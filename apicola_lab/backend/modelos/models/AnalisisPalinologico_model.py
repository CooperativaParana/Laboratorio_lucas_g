from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from modelos.models.Muestra_model import Muestra
from modelos.models.Especie_model import Especie


class AnalisisPalinologico(models.Model):
    """Modelo para análisis palinológicos"""
    MARCA_CHOICES = [
        ('x', 'x'),
        ('#', '#'),
        ('##', '##'),
    ]

    muestra = models.ForeignKey(
        Muestra, 
        on_delete=models.CASCADE,
        related_name='analisis_palinologicos',
        db_column='id_muestra'
    )
    especie = models.ForeignKey(
        Especie, 
        on_delete=models.RESTRICT,
        related_name='analisis_palinologicos',
        db_column='id_especie'
    )
    cantidad_granos = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="Cantidad de granos de polen"
    )
    marca_especial = models.CharField(
        max_length=10, 
        choices=MARCA_CHOICES,
        blank=True,
        null=True
    )
    porcentaje = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'analisis_palinologico'
        verbose_name = 'Análisis Palinológico'
        verbose_name_plural = 'Análisis Palinológicos'
        unique_together = ('muestra', 'especie')
        indexes = [
            models.Index(fields=['muestra'], name='idx_analisis_muestra'),
            models.Index(fields=['especie'], name='idx_analisis_especie'),
        ]

    def __str__(self):
        return f"Análisis {self.muestra} - {self.especie}"
