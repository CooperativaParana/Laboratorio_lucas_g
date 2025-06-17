from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from modelos.models.AnalistaManager_model import AnalistaManager


class Analista(AbstractBaseUser):
    """Modelo para los analistas con autenticación personalizada"""
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    contacto = models.CharField(max_length=100, blank=True, null=True)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AnalistaManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['nombres', 'apellidos']

    class Meta:
        db_table = 'analista'
        verbose_name = 'Analista'
        verbose_name_plural = 'Analistas'

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"

    def set_password(self, raw_password):
        """Método para establecer la contraseña hasheada"""
        from django.contrib.auth.hashers import make_password
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        """Método para verificar la contraseña"""
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password_hash)