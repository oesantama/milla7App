from maestras.models import Tab, PermisoPorRol, PermisoPorUsuario
from users.models import User, UserProfile
from django.db.models import Q

print("--- TABS ---")
for t in Tab.objects.all():
    print(f"ID: {t.id_tab}, Nombre: '{t.descripcion_tabs}'")

print("\n--- PERMISOS USER 'testprueba' ---")
try:
    u = User.objects.get(username='testprueba')
    profile = UserProfile.objects.get(user=u)
    print(f"User Role: {profile.role.descripcion_rol if profile.role else 'None'}")
    
    # Check permissions logic from serializer
    perms = []
    # Role perms
    if profile.role:
        role_perms = PermisoPorRol.objects.filter(rol=profile.role).select_related('tab')
        for p in role_perms:
            if p.tab:
                print(f"Role Perm - Tab: '{p.tab.descripcion_tabs}', Ver: {p.ver}, Crear: {p.crear}")

    # User perms
    user_perms = PermisoPorUsuario.objects.filter(usuario=u).select_related('tab')
    for p in user_perms:
        if p.tab:
            print(f"User Perm - Tab: '{p.tab.descripcion_tabs}', Ver: {p.ver}, Crear: {p.crear}")

except User.DoesNotExist:
    print("User testprueba not found")

print("\n--- PERMISOS USER 'testuser' ---")
try:
    u = User.objects.get(username='testuser')
    profile = UserProfile.objects.get(user=u)
    print(f"User Role: {profile.role.descripcion_rol if profile.role else 'None'} (ID: {profile.role.id_rol if profile.role else 'None'})")
    
    if profile.role:
        role_perms = PermisoPorRol.objects.filter(rol=profile.role).select_related('tab')
        if not role_perms.exists():
            print("No role permissions found.")
        for p in role_perms:
            if p.tab:
                print(f"Role Perm - Tab: '{p.tab.descripcion_tabs}', Ver: {p.ver}, Crear: {p.crear}")
except Exception as e:
    print(e)
