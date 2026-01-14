from django.db import models
from django.contrib.auth.models import User


class DeliveryPlan(models.Model):
    """
    Modelo genérico para almacenar planes de entrega/rutas.
    Soporta datos de Plan Normal (XLS) y Plan R (CSV).
    """
    # Información del plan
    plan_type = models.CharField(
        max_length=20,
        choices=[('PLAN_NORMAL', 'Plan Normal'), ('PLAN_R', 'Plan R')],
        help_text="Tipo de plan (Plan Normal o Plan R)"
    )
    
    # Campos del Plan R (CSV)
    wh_id = models.CharField(max_length=50, null=True, blank=True, verbose_name="Warehouse ID")
    un = models.CharField(max_length=50, null=True, blank=True, verbose_name="UN")
    cliente_code = models.CharField(max_length=50, null=True, blank=True, verbose_name="Código Cliente")
    sec_dir = models.CharField(max_length=50, null=True, blank=True, verbose_name="Sec Dir")
    nombre = models.CharField(max_length=200, null=True, blank=True, verbose_name="Nombre")
    dir_1 = models.CharField(max_length=300, null=True, blank=True, verbose_name="Dirección 1")
    dir_2 = models.CharField(max_length=300, null=True, blank=True, verbose_name="Dirección 2")
    latitud = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, verbose_name="Latitud")
    longitud = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, verbose_name="Longitud")
    empresa = models.CharField(max_length=200, null=True, blank=True, verbose_name="Empresa")
    conductor = models.CharField(max_length=200, null=True, blank=True, verbose_name="Conductor")
    placa = models.CharField(max_length=20, null=True, blank=True, verbose_name="Placa")
    carga = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name="Carga")
    
    # Campos adicionales genéricos (para Plan Normal XLS u otros datos)
    extra_field_1 = models.CharField(max_length=200, null=True, blank=True)
    extra_field_2 = models.CharField(max_length=200, null=True, blank=True)
    extra_field_3 = models.CharField(max_length=200, null=True, blank=True)
    extra_field_4 = models.TextField(null=True, blank=True)
    extra_field_5 = models.TextField(null=True, blank=True)
    
    # Metadatos de carga
    file_source = models.CharField(max_length=255, help_text="Nombre del archivo original")
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='delivery_plans')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'operations_delivery_plan'
        verbose_name = 'Plan de Entrega'
        verbose_name_plural = 'Planes de Entrega'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['plan_type', 'created_at']),
            models.Index(fields=['cliente_code']),
            models.Index(fields=['placa']),
        ]
    
    def __str__(self):
        if self.nombre:
            return f"{self.plan_type} - {self.nombre}"
        return f"{self.plan_type} - {self.id}"


class FileUploadLog(models.Model):
    """
    Registro de todas las cargas de archivos realizadas.
    """
    filename = models.CharField(max_length=255, verbose_name="Nombre del archivo")
    file_type = models.CharField(
        max_length=10,
        choices=[('XLS', 'Excel XLS'), ('XLSX', 'Excel XLSX'), ('CSV', 'CSV')],
        verbose_name="Tipo de archivo"
    )
    plan_type = models.CharField(
        max_length=20,
        choices=[('PLAN_NORMAL', 'Plan Normal'), ('PLAN_R', 'Plan R')],
        help_text="Tipo de plan importado"
    )
    
    # Estadísticas de procesamiento
    total_rows = models.IntegerField(default=0, verbose_name="Total de filas en archivo")
    records_processed = models.IntegerField(default=0, verbose_name="Registros procesados")
    records_success = models.IntegerField(default=0, verbose_name="Registros exitosos")
    records_failed = models.IntegerField(default=0, verbose_name="Registros fallidos")
    
    # Detalles de errores
    error_log = models.JSONField(null=True, blank=True, verbose_name="Log de errores")
    processing_time = models.FloatField(null=True, blank=True, verbose_name="Tiempo de procesamiento (segundos)")
    
    # Metadatos
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='file_uploads')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de carga")
    status = models.CharField(
        max_length=20,
        choices=[
            ('SUCCESS', 'Exitoso'),
            ('PARTIAL', 'Parcial'),
            ('FAILED', 'Fallido')
        ],
        default='SUCCESS'
    )
    
    class Meta:
        db_table = 'operations_file_upload_log'
        verbose_name = 'Log de Carga de Archivo'
        verbose_name_plural = 'Logs de Cargas de Archivos'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.filename} - {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"
