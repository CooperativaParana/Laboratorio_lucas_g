from django.db import models
from modelos.models.Apiario_model import Apiario


class MuestraTambor(models.Model):
    """Modelo para los tambores de miel"""
    num_registro = models.CharField(max_length=50, unique=True)
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

