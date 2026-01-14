import os
import django
import sys

# Setup Django environment
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milla7.settings')
django.setup()

from maestras.models import Modulo, Pagina, Tab

def restore():
    print("Restoring Menu Structure for Articulos...")

    # 1. Modulo: Maestras
    mod, created = Modulo.objects.get_or_create(
        descripcion_modulo='Maestras',
        defaults={
            'order': 10,
            'es_expansivo': True,
            'route': '/maestras',
            'icono': 'fa-cogs'
        }
    )
    print(f"Modulo 'Maestras': {mod.id} (Created: {created})")

    # 2. Pagina: Artículos
    pag, created = Pagina.objects.get_or_create(
        modulo=mod,
        descripcion_pages='Artículos',
        defaults={
            'order': 5,
            'route': '/maestras/articulos',
            'icono': 'fa-box'
        }
    )
    print(f"Pagina 'Artículos': {pag.id} (Created: {created})")

    # 3. Tab: Lista (Tabs usually map to sub-views like 'List', 'Create', but here it seems Tab maps to the page content itself sometimes)
    # Based on existing structure, allow 'Gestión'
    tab, created = Tab.objects.get_or_create(
        pagina=pag,
        descripcion_tabs='Gestión de Artículos',
        defaults={
            'route': '/maestras/articulos', 
            'icono': 'fa-list'
        }
    )
    print(f"Tab 'Gestión de Artículos': {tab.id_tab} (Created: {created})")
    
    # 4. Other Maestras
    maestras_def = [
        ('Vehículos', '/maestras/vehiculos', 'fa-truck'),
        ('Conductores', '/maestras/conductores', 'fa-user-tie'),
        ('Clientes', '/maestras/clientes', 'fa-building'),
        ('Tipos de Vehículo', '/maestras/tipos_vehiculos', 'fa-tags'),
        ('Categorías', '/maestras/categorias', 'fa-layer-group'),
        ('Roles y Permisos', '/maestras/roles', 'fa-user-shield'),
        ('Usuarios', '/maestras/usuarios', 'fa-users'),
        ('Unidades de Medida', '/maestras/unidades_medida', 'fa-ruler'),
        ('Tipos de Notificación', '/maestras/tipos-notificacion', 'fa-bell'),
        ('Correos Notificación', '/maestras/correos-notificacion', 'fa-envelope'),
    ]

    for nombre, route, icon in maestras_def:
        pg, _ = Pagina.objects.get_or_create(
            modulo=mod,
            descripcion_pages=nombre,
            defaults={
                'order': 99, 
                'route': route,
                'icono': icon
            }
        )
        Tab.objects.get_or_create(
            pagina=pg,
            descripcion_tabs=f'Gestión de {nombre}',
            defaults={'route': route}
        )
        print(f"Restored {nombre}")

if __name__ == '__main__':
    restore()
