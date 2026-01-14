from maestras.models import Tab

count = Tab.objects.count()
print(f"Total Tabs: {count}")

names = list(Tab.objects.values_list('descripcion_tabs', flat=True))
print(f"Names: {names}")
