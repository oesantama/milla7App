from maestras.models import Tab

print("--- ALL TABS ---")
for t in Tab.objects.all().order_by('id_tab'):
    print(f"ID: {t.id_tab}, Name: '{t.descripcion_tabs}'")
