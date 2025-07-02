from django.db import models
from django.utils import timezone
from modelos.models.Pool_model import Pool
from modelos.models.MuestraTambor_model import MuestraTambor


class ContienePool(models.Model):
    """Tabla intermedia para la relación Pool-MuestraTambor"""
    pool = models.ForeignKey(
        Pool, 
        on_delete=models.CASCADE,
        db_column='id_pool'
    )
    tambor = models.ForeignKey(
        MuestraTambor,
        on_delete=models.CASCADE,
        db_column='id_tambor'
    )
    fecha_asociacion = models.DateField(default=timezone.now)

    class Meta:
        db_table = 'ContienePool'
        unique_together = ('pool', 'tambor')
        verbose_name = 'ContienePool'
        verbose_name_plural = 'ContienePool'

    def __str__(self):
        return f"{self.pool} - {self.tambor}"