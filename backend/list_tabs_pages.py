from maestras.models import Tab

print("--- TABS WITH PAGES ---")
for t in Tab.objects.all().select_related('pagina').order_by('id_tab'):
    page_name = t.pagina.descripcion_pages if t.pagina else "No Page"
    print(f"ID: {t.id_tab}, Tab: '{t.descripcion_tabs}', Page: '{page_name}'")
