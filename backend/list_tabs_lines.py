from maestras.models import Tab

print("--- TABS LIST ---")
for t in Tab.objects.all().order_by('id_tab'):
    print(f"{t.id_tab}: {t.descripcion_tabs}")
