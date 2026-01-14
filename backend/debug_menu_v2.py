import sys
import traceback

# Redirect output to file
log_file = open('/app/debug_log.txt', 'w')
sys.stdout = log_file
sys.stderr = log_file

print("--- START DEBUG ---")

try:
    print("1. Importing models...")
    from maestras.models import Modulo, Pagina, Tab
    print("   Models imported.")
except Exception:
    traceback.print_exc()
    sys.exit(1)

try:
    print("2. Getting Modulo 'Maestras'...")
    modulo = Modulo.objects.get(descripcion_modulo="Maestras")
    print(f"   Modulo found: {modulo.id}")
except Exception:
    traceback.print_exc()
    sys.exit(1)

try:
    print("3. Creating/Getting Page 'Tipos Vehículos'...")
    pagina, created = Pagina.objects.get_or_create(
        descripcion_pages="Tipos Vehículos",
        defaults={
            'modulo': modulo,
            'route': '/maestras/tipos_vehiculos',
            'order': 7,
            'estado': True
        }
    )
    print(f"   Page: {pagina.id} (Created: {created})")
    if not created:
        pagina.modulo = modulo
        pagina.route = '/maestras/tipos_vehiculos'
        pagina.save()
        print("   Page updated.")
except Exception:
    traceback.print_exc()
    sys.exit(1)

try:
    print("4. Creating Tabs...")
    tabs_data = [
        {'name': 'Creacion Tipo', 'order': 1},
        {'name': 'Consulta Tipo Vehiculo', 'order': 2}
    ]
    for tab_info in tabs_data:
        tab, t_created = Tab.objects.get_or_create(
            descripcion_tabs=tab_info['name'],
            pagina=pagina,
            defaults={
                'estado': True
            }
        )
        print(f"   Tab '{tab.descripcion_tabs}': {tab.id_tab} (Created: {t_created})")
except Exception:
    traceback.print_exc()
    sys.exit(1)

print("--- END DEBUG ---")
