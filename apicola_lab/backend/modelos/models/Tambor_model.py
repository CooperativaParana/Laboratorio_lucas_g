from django.db import models
from modelos.models import Apiario



class Tambor(models.Model):
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
        db_table = 'tambor'
        verbose_name = 'Tambor'
        verbose_name_plural = 'Tambores'

    def __str__(self):
        return f"Tambor {self.num_registro}"

