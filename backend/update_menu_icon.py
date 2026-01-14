from maestras.models import Pagina

try:
    p = Pagina.objects.get(descripcion_pages='Tipos Vehículos')
    p.icono = 'fa-truck-moving'
    p.save()
    print(f"Updated icon for {p.descripcion_pages} to {p.icono}")
except Pagina.DoesNotExist:
    print("Page not found")
except Exception as e:
    print(f"Error: {e}")
