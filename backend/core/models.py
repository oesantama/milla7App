# ruta: backend/core/models.py
from django.db import models
from django.conf import settings

class Vehiculo(models.Model):
    placa = models.CharField(max_length=10, unique=True)
    propietario = models.CharField(max_length=100)
    cubicaje = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    modelo = models.CharField(max_length=50)
    tipo_vehiculo = models.ForeignKey(
        'TipoVehiculo',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Tipo de Vehículo"
    )
    estado = models.ForeignKey(
        'maestras.MasterEstado',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Estado"
    )
    eliminado = models.BooleanField(default=False, verbose_name="Eliminado")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    fecha_modificacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de modificación")
    usuario_creacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="vehiculos_created",
        verbose_name="Usuario de creación"
    )
    usuario_modificacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="vehiculos_modified",
        verbose_name="Usuario de modificación"
    )

    def __str__(self):
        return self.placa

class Conductor(models.Model):
    cedula = models.CharField(max_length=15, unique=True)
    nombre = models.CharField(max_length=100)
    celular = models.CharField(max_length=15)
    licencia = models.JSONField(default=list, verbose_name="Categorías de Licencia")
    estado = models.ForeignKey(
        'maestras.MasterEstado',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Estado"
    )
    eliminado = models.BooleanField(default=False, verbose_name="Eliminado")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    fecha_modificacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de modificación")
    usuario_creacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="conductores_created",
        verbose_name="Usuario de creación"
    )
    usuario_modificacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="conductores_modified",
        verbose_name="Usuario de modificación"
    )

    def __str__(self):
        return self.nombre

class Cliente(models.Model):
    nombre = models.CharField(max_length=150, verbose_name="Nombre del Cliente")
    logo = models.ImageField(upload_to='clientes/logos/', blank=True, null=True, verbose_name="Logo")
    estado = models.ForeignKey(
        'maestras.MasterEstado',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Estado"
    )
    eliminado = models.BooleanField(default=False, verbose_name="Eliminado")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    fecha_modificacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de modificación")
    usuario_creacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="clientes_created",
        verbose_name="Usuario de creación"
    )
    usuario_modificacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="clientes_modified",
        verbose_name="Usuario de modificación"
    )

    def __str__(self):
        return self.nombre

class TipoVehiculo(models.Model):
    descripcion = models.CharField(max_length=100, unique=True)
    estado = models.BooleanField(default=True)
    eliminado = models.BooleanField(default=False, verbose_name="Eliminado")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    fecha_modificacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de modificación")
    usuario_creacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tipos_vehiculo_created",
        verbose_name="Usuario de creación"
    )
    usuario_modificacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tipos_vehiculo_modified",
        verbose_name="Usuario de modificación"
    )


class Categoria(models.Model):
    descripcion = models.CharField(max_length=100, unique=True)
    estado = models.BooleanField(default=True)
    eliminado = models.BooleanField(default=False, verbose_name="Eliminado")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    fecha_modificacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de modificación")
    usuario_creacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="categorias_created",
        verbose_name="Usuario de creación"
    )
    usuario_modificacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="categorias_modified",
        verbose_name="Usuario de modificación"
    )

    def __str__(self):
        return self.descripcion

class UnidadMedida(models.Model):
    descripcion = models.CharField(max_length=100, unique=True, verbose_name="Descripción")
    abreviatura = models.CharField(max_length=10, blank=True, null=True, verbose_name="Abreviatura")
    estado = models.BooleanField(default=True, verbose_name="Estado")
    eliminado = models.BooleanField(default=False, verbose_name="Eliminado")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    fecha_modificacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de modificación")
    usuario_creacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="unidades_medida_created",
        verbose_name="Usuario de creación"
    )
    usuario_modificacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="unidades_medida_modified",
        verbose_name="Usuario de modificación"
    )

    def __str__(self):
        return self.descripcion

class Articulo(models.Model):
    codigo = models.CharField(max_length=50, null=True, blank=True, verbose_name="Código")
    descripcion = models.CharField(max_length=100)
    unidad_medida_general = models.ForeignKey(
        UnidadMedida,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="articulos_general",
        verbose_name="Unidad Medida General"
    )
    unidad_medida_especial = models.ForeignKey(
        UnidadMedida,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="articulos_especial",
        verbose_name="Unidad Medida Especial"
    )
    unidad_medida_intermedia = models.ForeignKey(
        UnidadMedida,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="articulos_intermedia",
        verbose_name="Unidad Medida Intermedia"
    )
    # Factores de Conversión (Base vs Unidad Específica)
    factor_general = models.FloatField(default=1.0, verbose_name="Factor General (Base)")
    factor_intermedio = models.FloatField(default=1.0, verbose_name="Factor Intermedio") 
    factor_especial = models.FloatField(default=1.0, verbose_name="Factor Especial")
    
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Categoría"
    )
    estado = models.ForeignKey(
        'maestras.MasterEstado',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Estado"
    )
    eliminado = models.BooleanField(default=False, verbose_name="Eliminado")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    fecha_modificacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de modificación")
    usuario_creacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="articulos_created",
        verbose_name="Usuario de creación"
    )
    usuario_modificacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="articulos_modified",
        verbose_name="Usuario de modificación"
    )

    def __str__(self):
        return self.descripcion