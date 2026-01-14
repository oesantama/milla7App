import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milla7.settings')
django.setup()

from logistics.models import EncSolicitud, DetalleSolicitud, Recepcion, DetalleRecepcion

print("Deleting DetalleRecepcion...")
DetalleRecepcion.objects.all().delete()
print("Deleting Recepcion...")
Recepcion.objects.all().delete()
print("Deleting DetalleSolicitud...")
DetalleSolicitud.objects.all().delete()
print("Deleting EncSolicitud...")
EncSolicitud.objects.all().delete()
print("Tables truncated successfully.")
