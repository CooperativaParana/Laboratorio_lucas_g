from django.db import models



class Apicultor(models.Model):
    """Modelo para los apicultores"""
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'apicultor'
        verbose_name = 'Apicultor'
        verbose_name_plural = 'Apicultores'

    def __str__(self):
        return f"{self.nombre} {self.apellido}"
