from maestras.models import Modulo

print("--- MODULES ---")
for m in Modulo.objects.all():
    print(f"ID: {m.id}, Name: '{m.descripcion_modulo}'")
