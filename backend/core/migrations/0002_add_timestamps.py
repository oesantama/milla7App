# Generated migration for core models
from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='cliente',
            name='fecha_creacion',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now, verbose_name='Fecha de creación'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='cliente',
            name='fecha_modificacion',
            field=models.DateTimeField(auto_now=True, verbose_name='Fecha de modificación'),
        ),
        migrations.AddField(
            model_name='cliente',
            name='usuario_creacion',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='clientes_created', to=settings.AUTH_USER_MODEL, verbose_name='Usuario de creación'),
        ),
        migrations.AddField(
            model_name='conductor',
            name='fecha_creacion',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now, verbose_name='Fecha de creación'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='conductor',
            name='fecha_modificacion',
            field=models.DateTimeField(auto_now=True, verbose_name='Fecha de modificación'),
        ),
        migrations.AddField(
            model_name='conductor',
            name='usuario_creacion',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='conductores_created', to=settings.AUTH_USER_MODEL, verbose_name='Usuario de creación'),
        ),
        migrations.AddField(
            model_name='vehiculo',
            name='fecha_creacion',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now, verbose_name='Fecha de creación'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vehiculo',
            name='fecha_modificacion',
            field=models.DateTimeField(auto_now=True, verbose_name='Fecha de modificación'),
        ),
        migrations.AddField(
            model_name='vehiculo',
            name='usuario_creacion',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='vehiculos_created', to=settings.AUTH_USER_MODEL, verbose_name='Usuario de creación'),
        ),
    ]
