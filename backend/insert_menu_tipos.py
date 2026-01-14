from maestras.models import Modulo, Pagina, Tab

# 1. Encontrar Modulo Maestras
try:
    modulo = Modulo.objects.get(descripcion="Maestras")
except Modulo.DoesNotExist:
    print("Error: Modulo 'Maestras' no encontrado. Asegúrese de que existe.")
    exit()

# 2. Crear Pagina 'Tipos Vehículos' (o obtener si existe)
pagina, created = Pagina.objects.get_or_create(
    descripcion_pages="Tipos Vehículos",
    defaults={
        'modulo': modulo,
        'path': '/maestras/tipos_vehiculos',
        'icon': 'fa-truck-moving', # Icono sugerido
        'order': 7,
        'estado': True
    }
)

if created:
    print(f"Pagina '{pagina.descripcion_pages}' creada.")
else:
    print(f"Pagina '{pagina.descripcion_pages}' ya existe.")
    # Asegurar path correcto por si acaso
    pagina.path = '/maestras/tipos_vehiculos'
    pagina.modulo = modulo
    pagina.save()

# 3. Crear Tabs 'Creacion Tipo' y 'Consulta Tipo Vehiculo'
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
    if t_created:
        print(f"Tab '{tab.descripcion_tabs}' creado.")
    else:
        print(f"Tab '{tab.descripcion_tabs}' ya existe.")

print("Configuración de menú completada exitosamente.")
