from django.db import models
from django.utils import timezone
from modelos.models.Analista_model import Analista
from modelos.models.MuestraTambor_model import MuestraTambor


class Pool(models.Model):
    """Modelo para las muestras de miel"""
    analista = models.ForeignKey(
        Analista, 
        on_delete=models.RESTRICT,
        related_name='pools',
        db_column='id_analista'
    )
    tambores = models.ManyToManyField(
        MuestraTambor,
        through='ContienePool', # Si no anda, cambiar a 'modelo.ContienePool'
        related_name='pools'
    )
    fecha_analisis = models.DateField(null=True, blank=True)
    num_registro = models.CharField(max_length=50, unique=True, null=True, blank=True)
    observaciones = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pool'
        verbose_name = 'Pool'
        verbose_name_plural = 'Pools'
        indexes = [
            models.Index(fields=['analista'], name='idx_pool_analista'),
        ]

    def save(self, *args, **kwargs):
        if not self.num_registro or self.num_registro == '':
            # Buscar el último número de registro existente
            ultimo = Pool.objects.order_by('-id').first()
            if ultimo and ultimo.num_registro and ultimo.num_registro.isdigit():
                nuevo_num = int(ultimo.num_registro) + 1
            else:
                nuevo_num = 1
            self.num_registro = str(nuevo_num).zfill(5)  # Ejemplo: 00001, 00002
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Pool {self.num_registro or self.id}"