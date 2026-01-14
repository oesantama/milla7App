# ruta: backend/maestras/models.py
from django.db import models
from django.conf import settings

# Common fields for tracking creation and modification
class TimeStampedModel(models.Model):
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    fecha_modificacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de modificación")
    usuario_creacion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(app_label)s_%(class)s_created_by",
        verbose_name="Usuario de creación"
    )
    estado = models.BooleanField(default=True, verbose_name="Estado")

    class Meta:
        abstract = True

class Modulo(TimeStampedModel):
    id = models.AutoField(primary_key=True)
    descripcion_modulo = models.CharField(max_length=100, unique=True, verbose_name="Descripción")
    order = models.IntegerField(default=0, verbose_name="Orden")
    es_expansivo = models.BooleanField(default=True, verbose_name="Es Expansivo")
    route = models.CharField(max_length=255, blank=True, null=True, verbose_name="Ruta")

    class Meta:
        ordering = ['order']
        verbose_name = "Módulo"
        verbose_name_plural = "Módulos"

    def __str__(self):
        return self.descripcion_modulo

class Pagina(TimeStampedModel):
    id = models.AutoField(primary_key=True)
    modulo = models.ForeignKey(Modulo, on_delete=models.CASCADE, related_name='paginas', verbose_name="Módulo")
    descripcion_pages = models.CharField(max_length=100, verbose_name="Descripción")
    order = models.IntegerField(default=0, verbose_name="Orden")
    icono = models.CharField(max_length=100, blank=True, null=True, verbose_name="Icono")
    route = models.CharField(max_length=255, blank=True, null=True, verbose_name="Ruta")

    class Meta:
        unique_together = ('modulo', 'descripcion_pages')
        ordering = ['order']
        verbose_name = "Página"
        verbose_name_plural = "Páginas"

    def __str__(self):
        return f"{self.modulo.descripcion_modulo} > {self.descripcion_pages}"

class Tab(TimeStampedModel):
    id_tab = models.AutoField(primary_key=True)
    pagina = models.ForeignKey(Pagina, on_delete=models.CASCADE, related_name='tabs', verbose_name="Página")
    descripcion_tabs = models.CharField(max_length=100, verbose_name="Descripción")
    icono = models.CharField(max_length=100, blank=True, null=True, verbose_name="Icono")
    route = models.CharField(max_length=255, blank=True, null=True, verbose_name="Ruta")

    class Meta:
        unique_together = ('pagina', 'descripcion_tabs')
        ordering = ['pagina__order', 'descripcion_tabs']
        verbose_name = "Tab"
        verbose_name_plural = "Tabs"

    def __str__(self):
        return f"{self.pagina.descripcion_pages} > {self.descripcion_tabs}"

class Rol(TimeStampedModel):
    id_rol = models.AutoField(primary_key=True)
    descripcion_rol = models.CharField(max_length=100, unique=True, verbose_name="Descripción")

    class Meta:
        ordering = ['descripcion_rol']
        verbose_name = "Rol"
        verbose_name_plural = "Roles"

    def __str__(self):
        return self.descripcion_rol

class PermisoPorRol(TimeStampedModel):
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE, related_name='permisos', verbose_name="Rol")
    tab = models.ForeignKey(Tab, on_delete=models.CASCADE, related_name='permisos_rol', verbose_name="Tab")
    ver = models.BooleanField(default=False)
    crear = models.BooleanField(default=False)
    editar = models.BooleanField(default=False)
    borrar = models.BooleanField(default=False)

    class Meta:
        unique_together = ('rol', 'tab')
        verbose_name = "Permiso por Rol"
        verbose_name_plural = "Permisos por Rol"

    def __str__(self):
        return f"Rol: {self.rol.descripcion_rol} | Tab: {self.tab.descripcion_tabs}"

class PermisoPorUsuario(TimeStampedModel):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='permisos_especiales',
        verbose_name="Usuario"
    )
    tab = models.ForeignKey(Tab, on_delete=models.CASCADE, related_name='permisos_usuario', verbose_name="Tab")
    cliente = models.ForeignKey(
        'core.Cliente',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='permisos_usuario',
        verbose_name="Cliente"
    )
    ver = models.BooleanField(default=False)
    crear = models.BooleanField(default=False)
    editar = models.BooleanField(default=False)
    borrar = models.BooleanField(default=False)

    class Meta:
        unique_together = ('usuario', 'tab', 'cliente')
        verbose_name = "Permiso por Usuario"
        verbose_name_plural = "Permisos por Usuario"

    def __str__(self):
        if self.cliente:
            return f"Usuario: {self.usuario.username} | Tab: {self.tab.descripcion_tabs} | Cliente: {self.cliente.name}"
        return f"Usuario: {self.usuario.username} | Tab: {self.tab.descripcion_tabs}"

class MasterEstado(TimeStampedModel):
    id = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=50, unique=True, verbose_name="Descripción") # Renamed nombre -> descripcion per user request
    # Note: User asked for "id, descripcion, estado", inherited TimeStampedModel has estado.
    # We remove 'nombre' field (or rename it). Since 'nombre' was unique, we keep 'descripcion' unique.
    
    class Meta:
        db_table = 'master_estados'
        verbose_name = "Estado Maestro"
        verbose_name_plural = "Estados Maestros"

    def __str__(self):
        return f"{self.id} - {self.descripcion}"

class TipoNotificacion(TimeStampedModel):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre Tipo Notificación")
    descripcion = models.CharField(max_length=255, blank=True, null=True, verbose_name="Descripción")
    # Inherits estado, usuario_creacion, fecha_creacion, etc. from TimeStampedModel
    # Note: User requested specifically usuario_modificacion and date, which TimeStampedModel provides.

    class Meta:
        verbose_name = "Tipo de Notificación"
        verbose_name_plural = "Tipos de Notificación"

    def __str__(self):
        return self.nombre