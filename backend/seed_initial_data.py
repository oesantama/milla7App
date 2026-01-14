import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milla7.settings')
django.setup()

from maestras.models import Modulo, Pagina, Tab

def seed_data():
    print("Seeding initial data (User Verified Structure)...")
    
    # 1. CLEANUP (Standardize starting state)
    # We delete everything to ensure IDs and Orders are clean
    Tab.objects.all().delete()
    Pagina.objects.all().delete()
    Modulo.objects.all().delete()
    
    # ==========================================
    # MODULO 1: MAESTRAS
    # ==========================================
    m_maestras = Modulo.objects.create(
        descripcion_modulo="Maestras", 
        order=1, 
        es_expansivo=True, 
        route="/maestras"
    )
    
    # Helper to create Page + Default Tab (Required for permissions)
    def create_page_and_tab(modulo, name, route, icon, order):
        # Create Page
        p = Pagina.objects.create(
            modulo=modulo,
            descripcion_pages=name,
            route=route,
            icono=icon,
            order=order,
            estado=True
        )
        # Create Default Tab (Same name/route) so it appears in permissions
        Tab.objects.create(
            pagina=p,
            descripcion_tabs=name, # Using same name as page for simplicity in menu
            route=route,
            icono=icon,
            estado=True
        )
        print(f"Created Page: {name} -> Route: {route}")

    # Lista definida por el usuario:
    # "usuarios, rol permiso rol, articulo, vehiculo, conductor, 
    # tiponofiticacion, correo notificacion, clientes, unidad de medida"
    
    # Note: 'Items' was also mentioned in previous turns/file structure, including it to be safe or skipping? 
    # User said: "en maestrae va (usuarios...)" list didn't have Items explicitly in this prompt but file system has it. 
    # I will stick STRICTLY to the explicit list in the prompt first, adding Items if it was in the "functioning" version.
    # The prompt part "paginas de items" suggests it was there.
    
    create_page_and_tab(m_maestras, "Items", "/maestras/items", "fa fa-cubes", 1)
    create_page_and_tab(m_maestras, "Usuarios", "/maestras/usuarios", "fa fa-users", 2)
    create_page_and_tab(m_maestras, "Roles", "/maestras/roles", "fa fa-user-tag", 3)
    create_page_and_tab(m_maestras, "Permisos", "/maestras/permisos", "fa fa-key", 4) # "permiso rol"
    create_page_and_tab(m_maestras, "Artículos", "/maestras/articulos", "fa fa-box", 5)
    create_page_and_tab(m_maestras, "Vehículos", "/maestras/vehiculos", "fa fa-truck", 6)
    create_page_and_tab(m_maestras, "Tipos de Vehículos", "/maestras/tipos_vehiculos", "fa fa-truck-moving", 7) # "y todo lo que tenia maestras" -> inferred
    create_page_and_tab(m_maestras, "Conductores", "/maestras/conductores", "fa fa-id-card", 8)
    create_page_and_tab(m_maestras, "Tipo Notificación", "/maestras/tipos-notificacion", "fa fa-bell", 9)
    create_page_and_tab(m_maestras, "Correo Notificación", "/maestras/correos-notificacion", "fa fa-envelope", 10)
    create_page_and_tab(m_maestras, "Clientes", "/maestras/clientes", "fa fa-building", 11)
    create_page_and_tab(m_maestras, "Unidades de Medida", "/maestras/unidades_medida", "fa fa-ruler", 12)

    # ==========================================
    # MODULO 2: OPERACIONES
    # ==========================================
    m_ops = Modulo.objects.create(
        descripcion_modulo="Operaciones", 
        order=2, 
        es_expansivo=True, 
        route="/operaciones"
    )
    
    create_page_and_tab(m_ops, "Pedidos", "/operaciones/pedidos", "fa fa-file-invoice", 1)
    create_page_and_tab(m_ops, "Despachos", "/operaciones/despachos", "fa fa-shipping-fast", 2)

    print("Data seeded successfully!")

if __name__ == '__main__':
    seed_data()
