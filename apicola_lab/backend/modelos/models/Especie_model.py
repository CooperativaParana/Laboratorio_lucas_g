from django.db import models



class Especie(models.Model):
    """Modelo para las especies de plantas"""
    nombre_cientifico = models.CharField(max_length=150, unique=True)
    nombre_comun = models.CharField(max_length=100, blank=True, null=True)
    familia = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'especies'
        verbose_name = 'Especie'
        verbose_name_plural = 'Especies'
        indexes = [
            models.Index(fields=['nombre_cientifico'], name='idx_especies_nombre'),
        ]

    def __str__(self):
        if self.nombre_comun:
            return f"{self.nombre_cientifico} ({self.nombre_comun})"
        return self.nombre_cientifico
