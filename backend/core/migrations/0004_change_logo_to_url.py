# Migration to change logo from ImageField to CharField
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_simplify_cliente'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cliente',
            name='logo',
            field=models.CharField(blank=True, max_length=500, null=True, verbose_name='URL del Logo'),
        ),
    ]
