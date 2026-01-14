# Generated migration for simplified Cliente model
from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0002_add_timestamps'),
    ]

    operations = [
        # Add usuario_modificacion to all models
        migrations.AddField(
            model_name='vehiculo',
            name='usuario_modificacion',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='vehiculos_modified', to=settings.AUTH_USER_MODEL, verbose_name='Usuario de modificación'),
        ),
        migrations.AddField(
            model_name='conductor',
            name='usuario_modificacion',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='conductores_modified', to=settings.AUTH_USER_MODEL, verbose_name='Usuario de modificación'),
        ),
        migrations.AddField(
            model_name='cliente',
            name='usuario_modificacion',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='clientes_modified', to=settings.AUTH_USER_MODEL, verbose_name='Usuario de modificación'),
        ),
        # Remove unnecessary fields from Cliente
        migrations.RemoveField(
            model_name='cliente',
            name='nit',
        ),
        migrations.RemoveField(
            model_name='cliente',
            name='tipo',
        ),
        migrations.RemoveField(
            model_name='cliente',
            name='direccion',
        ),
        migrations.RemoveField(
            model_name='cliente',
            name='zona',
        ),
        migrations.RemoveField(
            model_name='cliente',
            name='representante',
        ),
        migrations.RemoveField(
            model_name='cliente',
            name='telefono',
        ),
        # Change logo field from CharField to ImageField
        migrations.AlterField(
            model_name='cliente',
            name='logo',
            field=models.ImageField(blank=True, null=True, upload_to='clientes/logos/', verbose_name='Logo'),
        ),
        migrations.AlterField(
            model_name='cliente',
            name='nombre',
            field=models.CharField(max_length=150, verbose_name='Nombre del Cliente'),
        ),
        migrations.AlterField(
            model_name='cliente',
            name='estado',
            field=models.BooleanField(default=True, verbose_name='Estado'),
        ),
    ]
