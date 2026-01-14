import os
import django
import sys

# Setup Django Environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milla7.settings')
django.setup()

from maestras.models import MasterEstado
from django.db import transaction

# States to ensure exist
# Format: (nombre_descripcion, estado_bool)
REQUIRED_STATES = [
    ("activo", True),
    ("inactivo", True),
    ("disponible", True),
    ("no disponible", True),
    ("en taller", True),
    ("abierto", True),
    ("cerrado", True),
    ("en proceso", True),
    # Business Logic States mappings (Renaming per request)
    ("Recibido", True),          # Was 'Inventariado'
    ("RECIBIDO_CON_NOVEDAD", True), # Was 'FINALIZADO_CON_NOVEDAD'
    ("Planificado", True),
    ("En Ruta", True),
    ("Entregado", True),
    ("Pendiente", True),        # Default import status
    ("En Revisión", True),      # Recibido logic
    ("Finalizado OK", True),    # Recibido logic
]

def populate():
    print("Iniciando poblado de master_estados...")
    created_count = 0
    updated_count = 0
    
    with transaction.atomic():
        for desc, active in REQUIRED_STATES:
            # Check existence by description (case insensitive?)
            # User wants lowercase keying or just description?
            # Model has 'descripcion' unique field.
            
            obj, created = MasterEstado.objects.get_or_create(
                descripcion__iexact=desc,
                defaults={
                    'descripcion': desc,
                    'estado': active
                }
            )
            
            if created:
                created_count += 1
                print(f" [+] Creado: {obj.descripcion}")
            else:
                updated_count += 1
                # Ensure case matches? Or leave as is?
                # User asked to create if not exists.
                print(f" [.] Ya existe: {obj.descripcion}")

    print(f"\nResumen: {created_count} creados, {updated_count} existentes.")

if __name__ == '__main__':
    populate()
