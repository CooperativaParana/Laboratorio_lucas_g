from django.db import models
from django.core.validators import MinValueValidator
from modelos.models.Apicultor_model import Apicultor  



class Apiario(models.Model):
    """Modelo para los apiarios"""
    apicultor = models.ForeignKey(
        Apicultor, 
        on_delete=models.CASCADE, 
        related_name='apiarios',
        db_column='id_apicultor'
    )
    nombre_apiario = models.CharField(max_length=100)
    cant_colmenas = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Cantidad de colmenas debe ser mayor a 0"
    )
    localidad = models.CharField(max_length=100)
    latitud = models.DecimalField(
        max_digits=10, 
        decimal_places=8, 
        null=True, 
        blank=True,
        help_text="Coordenada de latitud"
    )
    longitud = models.DecimalField(
        max_digits=11, 
        decimal_places=8, 
        null=True, 
        blank=True,
        help_text="Coordenada de longitud"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'apiarios'
        verbose_name = 'Apiario'
        verbose_name_plural = 'Apiarios'
        indexes = [
            models.Index(fields=['apicultor'], name='idx_apiarios_apicultor'),
        ]

    def __str__(self):
        return f"{self.nombre_apiario} - {self.apicultor}"