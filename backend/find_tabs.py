from maestras.models import Tab
from django.db.models import Q

print("--- SEARCH TABS ---")
targets = ['vehic', 'conduct', 'usuari', 'client', 'item', 'rol', 'permis']
for t in targets:
    tabs = Tab.objects.filter(descripcion_tabs__icontains=t)
    for tab in tabs:
        print(f"Target '{t}': ID={tab.id_tab}, Name='{tab.descripcion_tabs}'")
