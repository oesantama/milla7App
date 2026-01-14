# ruta: backend/users/models.py
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.ForeignKey('maestras.Rol', on_delete=models.SET_NULL, null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    clientes = models.ManyToManyField('core.Cliente', blank=True, related_name='usuarios_asignados')
    eliminado = models.BooleanField(default=False, verbose_name="Eliminado")

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return f"{self.user.username} ({self.role})"
