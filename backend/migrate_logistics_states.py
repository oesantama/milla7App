import os
import django
import sys

# Setup Django Environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milla7.settings')
django.setup()

from logistics.models import Recepcion, Despacho, CorreosNotificacion
from maestras.models import MasterEstado
from django.db import transaction

def migrate_data():
    print("Iniciando migración de datos a MasterEstado...")
    
    with transaction.atomic():
        # 1. Recepcion
        for obj in Recepcion.objects.all():
            old_state = obj.estado # String
            new_state_name = old_state
            
            # Mappings
            if old_state == 'Inventariado':
                new_state_name = 'Recibido'
            elif old_state == 'FINALIZADO_CON_NOVEDAD':
                new_state_name = 'RECIBIDO_CON_NOVEDAD'
            # Add other mappings if strictly necessary, but populator handled exact matches
            
            # Find or Create
            master_state, created = MasterEstado.objects.get_or_create(
                descripcion__iexact=new_state_name,
                defaults={'descripcion': new_state_name}
            )
            
            obj.estado_fk = master_state
            obj.save()
            print(f"Recepcion {obj.id}: {old_state} -> {master_state.descripcion}")

        # 2. Despacho
        for obj in Despacho.objects.all():
            old_state = obj.estado
            new_state_name = old_state
            
            master_state, created = MasterEstado.objects.get_or_create(
                descripcion__iexact=new_state_name,
                defaults={'descripcion': new_state_name}
            )
            
            obj.estado_fk = master_state
            obj.save()
            print(f"Despacho {obj.id}: {old_state} -> {master_state.descripcion}")

        # 3. CorreosNotificacion (Boolean -> 'activo'/'inactivo')
        for obj in CorreosNotificacion.objects.all():
            is_active = obj.estado # boolean
            target_state = 'activo' if is_active else 'inactivo'
            
            master_state, created = MasterEstado.objects.get_or_create(
                descripcion__iexact=target_state,
                defaults={'descripcion': target_state}
            )
            
            obj.estado_fk = master_state
            obj.save()
            print(f"Correo {obj.id}: {is_active} -> {master_state.descripcion}")
            
    print("Migración completada exitosamente.")

if __name__ == '__main__':
    migrate_data()
