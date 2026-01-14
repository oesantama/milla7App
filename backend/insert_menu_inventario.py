import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milla7.settings')
django.setup()

from maestras.models import Modulo, Pagina, Tab

def insert_menu():
    try:
        # 1. Get Module "Maestras"
        modulo = Modulo.objects.get(descripcion_modulo="Maestras")
        print(f"Modulo encontrado: {modulo.descripcion_modulo} (ID: {modulo.id})")

        # 2. Create Pages
        paginas_data = [
            {
                "descripcion": "Categorías",
                "route": "/maestras/categorias",
                "icono": "fa-tags",
                "orden": 50,
                "tabs": ["Consulta Categorías", "Crear Categoría"]
            },
            {
                "descripcion": "Artículos",
                "route": "/maestras/articulos",
                "icono": "fa-box",
                "orden": 60,
                "tabs": ["Consulta Artículos", "Crear Artículo"]
            },
            {
                "descripcion": "Unidades de Medida",
                "route": "/maestras/unidades_medida",
                "icono": "fa-ruler",
                "orden": 70,
                "tabs": ["Consulta Unidades", "Crear Unidad"]
            }
        ]

        for p_data in paginas_data:
            pagina, created = Pagina.objects.get_or_create(
                route=p_data["route"],
                defaults={
                    "modulo": modulo,
                    "descripcion_pages": p_data["descripcion"],
                    "icono": p_data["icono"],
                    "order": p_data["orden"],
                }
            )
            if created:
                print(f"Pagina creada: {pagina.descripcion_pages}")
            else:
                print(f"Pagina ya existe: {pagina.descripcion_pages}")
                # Update icon
                if pagina.icono != p_data["icono"]:
                    pagina.icono = p_data["icono"]
                    pagina.save()
                    print(f"Icono actualizado para {pagina.descripcion_pages}")
            
            # Create Tabs
            for idx, tab_name in enumerate(p_data["tabs"]):
                tab, t_created = Tab.objects.get_or_create(
                    pagina=pagina,
                    descripcion_tabs=tab_name,
                    defaults={
                        "route": p_data["route"], # Assuming same route for tabs or different? Using page route for now
                        "icono": "fa-circle", # Default icon
                    }
                )
                if t_created:
                     print(f"Tab creado: {tab.descripcion_tabs}")


    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    insert_menu()
