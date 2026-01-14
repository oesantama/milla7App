
import os
import django
import sys

# Setup Django environment
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milla7.settings')
django.setup()

from maestras.models import Pagina

def remove_duplicate_vehiculos():
    print("Checking for duplicate 'Vehículos' pages...")
    
    # Check for pages with description 'Vehículos' or 'Vehiculos'
    pages = Pagina.objects.filter(descripcion_pages__in=['Vehículos', 'Vehiculos'])
    
    print(f"Found {pages.count()} pages for Vehículos.")
    
    if pages.count() > 1:
        # Keep the one with ID that might be linked to correct tabs, 
        # but usually the one with the correct accent is preferred if consistent.
        # Let's keep the one with descripcion 'Vehículos' if exists, else first one.
        
        preferred = pages.filter(descripcion_pages='Vehículos').first()
        if not preferred:
            preferred = pages.first()
            
        print(f"Keeping page ID: {preferred.id} - {preferred.descripcion_pages}")
        
        for p in pages:
            if p.id != preferred.id:
                print(f"Deleting duplicate page ID: {p.id} - {p.descripcion_pages}")
                # Optional: Reassign tabs if needed, but 'restore_menu' usually recreates them.
                # Assuming tabs cascade delete or just delete them.
                p.delete()
                
        print("Duplicates removed.")
    else:
        print("No duplicates found.")

if __name__ == '__main__':
    remove_duplicate_vehiculos()
