from django.db import models

class EncSolicitud(models.Model):
    un_orig = models.CharField(max_length=255, null=True, blank=True)
    f_demanda = models.DateField(null=True, blank=True)
    n_ped = models.CharField(max_length=255, null=True, blank=True)
    placa = models.CharField(max_length=50, null=True, blank=True)
    # remision_transferencia removed and moved to DetalleSolicitud
    carga = models.CharField(max_length=255, null=True, blank=True)
    direccion_1 = models.CharField(max_length=255, null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    
    # New field to distinguish Normal vs R
    plan_type = models.CharField(
        max_length=20, 
        choices=[('PLAN_NORMAL', 'Plan Normal'), ('PLAN_R', 'Plan R')],
        default='PLAN_NORMAL'
    )
    
    # Control fields
    fecha_carge = models.DateTimeField(auto_now_add=True, null=True)
    usuario_carge = models.CharField(max_length=255, null=True, blank=True)
    
    # Legacy/Extra fields (kept for safety or removal if desired, user didn't ask to remove)
    message = models.TextField(null=True, blank=True) 
    fecha_control = models.DateTimeField(auto_now_add=True) 
    usuario_control = models.CharField(max_length=255, null=True, blank=True)

    estado = models.ForeignKey(
        'maestras.MasterEstado',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='solicitudes',
        verbose_name="Estado"
    )

    class Meta:
        db_table = 'enc_solicitud'

class DetalleSolicitud(models.Model):
    id = models.AutoField(primary_key=True)
    articulo = models.CharField(max_length=255, null=True, blank=True)
    cant_env = models.IntegerField(null=True, blank=True)
    total_volume = models.FloatField(null=True, blank=True)
    um = models.CharField(max_length=50, null=True, blank=True)
    volumen = models.FloatField(null=True, blank=True)
    encabezado = models.ForeignKey(EncSolicitud, on_delete=models.CASCADE, related_name='detalles')
    
    # Moved/Added fields per Refactor
    remision_transferencia = models.CharField(max_length=255, null=True, blank=True)
    n_ped = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'detalle_solicitud'

class Recepcion(models.Model):
    id = models.AutoField(primary_key=True)
    encabezado = models.ForeignKey(EncSolicitud, on_delete=models.CASCADE, related_name='recepciones')
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    estado = models.ForeignKey(
        'maestras.MasterEstado', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='recepciones'
    )
    usuario = models.CharField(max_length=255, null=True, blank=True)
    intentos_fallidos = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'recepcion'

class DetalleRecepcion(models.Model):
    id = models.AutoField(primary_key=True)
    recepcion = models.ForeignKey(Recepcion, on_delete=models.CASCADE, related_name='detalles')
    articulo = models.ForeignKey('core.Articulo', on_delete=models.SET_NULL, null=True, blank=True)
    cantidad_contada_base = models.FloatField(default=0.0) # Normalized to base unit
    novedad = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'detalle_recepcion'

class CorreosNotificacion(models.Model):
    id = models.AutoField(primary_key=True)
    correo = models.EmailField(max_length=255)
    nombre_contacto = models.CharField(max_length=255, null=True, blank=True, verbose_name="Nombre Contacto/Usuario")
    tipo_novedad = models.ForeignKey(
        'maestras.TipoNotificacion',
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        related_name='correos_suscritos'
    )
    estado = models.ForeignKey(
        'maestras.MasterEstado',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='correos'
    )
    
    # Audit fields requested by user
    usuario_registro = models.CharField(max_length=255, null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'correos_notificacion'
        verbose_name = "Correo de Notificación"
        verbose_name_plural = "Correos de Notificación"

    def __str__(self):
        return f"{self.correo} - {self.tipo_novedad}"

class Despacho(models.Model):
    id = models.AutoField(primary_key=True)
    vehiculo = models.ForeignKey('core.Vehiculo', on_delete=models.SET_NULL, null=True, blank=True)
    conductor = models.ForeignKey('core.Conductor', on_delete=models.SET_NULL, null=True, blank=True)
    fecha_despacho = models.DateField(auto_now_add=True)
    estado = models.ForeignKey(
        'maestras.MasterEstado',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='despachos'
    )
    capacidad_ocupada = models.FloatField(default=0.0) # Snapshot of occupied volume
    usuario_creacion = models.CharField(max_length=255, null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'despacho'

class DetalleDespacho(models.Model):
    id = models.AutoField(primary_key=True)
    despacho = models.ForeignKey(Despacho, on_delete=models.CASCADE, related_name='detalles')
    pedido_n = models.CharField(max_length=255, null=True, blank=True) # Factura / Pedido
    direccion = models.CharField(max_length=255, null=True, blank=True)
    volumen_total = models.FloatField(default=0.0)
    peso_total = models.FloatField(default=0.0)
    
    # Optional: Store IDs of specific items if needed for strict tracking
    # items = models.JSONField(default=list) 

    class Meta:
        db_table = 'detalle_despacho'
