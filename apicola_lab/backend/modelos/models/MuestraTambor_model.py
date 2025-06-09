from django.db import models
from django.utils import timezone
from modelos.models import Muestra, Tambor


class MuestraTambor(models.Model):
    """Tabla intermedia para la relación Muestra-Tambor"""
    muestra = models.ForeignKey(
        Muestra, 
        on_delete=models.CASCADE,
        db_column='id_muestra'
    )
    tambor = models.ForeignKey(
        Tambor, 
        on_delete=models.CASCADE,
        db_column='id_tambor'
    )
    fecha_asociacion = models.DateField(default=timezone.now)

    class Meta:
        db_table = 'muestra_tambor'
        unique_together = ('muestra', 'tambor')
        verbose_name = 'Asociación Muestra-Tambor'
        verbose_name_plural = 'Asociaciones Muestra-Tambor'

    def __str__(self):
        return f"{self.muestra} - {self.tambor}"