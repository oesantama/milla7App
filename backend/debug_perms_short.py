from maestras.models import Tab, PermisoPorRol, PermisoPorUsuario
from users.models import User, UserProfile

print("\n--- PERMISOS USER 'testprueba' ---")
try:
    u = User.objects.get(username='testprueba')
    profile = UserProfile.objects.get(user=u)
    print(f"User: {u.username}, Role: {profile.role.descripcion_rol if profile.role else 'None'}")
    
    # User perms
    user_perms = PermisoPorUsuario.objects.filter(usuario=u).select_related('tab')
    for p in user_perms:
        if p.tab:
            print(f"Direct Perm - Tab: '{p.tab.descripcion_tabs}', Ver: {p.ver}, Crear: {p.crear}, Editar: {p.editar}, Borrar: {p.borrar}")

except User.DoesNotExist:
    print("User testprueba not found")
