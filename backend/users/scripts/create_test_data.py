# ruta: backend/users/scripts/create_test_data.py
from django.contrib.auth import get_user_model
from users.models import UserProfile, UserPermission
from maestras.models import Module, Page, Tab, Operation
import os
import django

# Configure Django settings if not already configured
# This is necessary when running a script directly outside of manage.py commands
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milla7.settings')
django.setup()

def run():
    User = get_user_model()

    # 1. Get or create testuser
    username = os.environ.get('TEST_USERNAME', 'testuser')
    password = os.environ.get('TEST_PASSWORD', 'testpassword')
    email = os.environ.get('TEST_EMAIL', 'test@example.com')

    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    if created:
        user.set_password(password)
        user.save()
        print(f"Created superuser: {username}")
    else:
        print(f"Superuser {username} already exists.")
        # Ensure password is set if user already exists but password might not be
        if not user.check_password(password):
            user.set_password(password)
            user.save()
            print(f"Updated password for {username}.")

    # 2. Create UserProfile for testuser
    profile, created = UserProfile.objects.get_or_create(user=user, defaults={'role': 'admin', 'phone_number': '123456789'})
    if created:
        print(f"Created UserProfile for {username}.")
    else:
        print(f"UserProfile for {username} already exists.")

    # 3. Create dummy Maestras data
    module_maestras, _ = Module.objects.get_or_create(name='Maestras', slug='maestras', order=1)
    page_ops, _ = Page.objects.get_or_create(module=module_maestras, name='Gestión de Operaciones', slug='gestion-operaciones', order=1)
    tab_ops_detail, _ = Tab.objects.get_or_create(page=page_ops, name='Detalle de Operación', slug='detalle-operacion', operation_type='I', order=1)

    module_users, _ = Module.objects.get_or_create(name='Usuarios', slug='usuarios', order=2)
    page_create_user, _ = Page.objects.get_or_create(module=module_users, name='Crear Usuario', slug='crear-usuario', url_path='/users/create', order=1)
    tab_create_form, _ = Tab.objects.get_or_create(page=page_create_user, name='Formulario de Creación', slug='formulario-creacion', operation_type='G', order=1)
    page_assign_perms, _ = Page.objects.get_or_create(module=module_users, name='Asignar Permisos', slug='asignar-permisos', url_path='/users/assign-permissions', order=2)
    tab_assign_form, _ = Tab.objects.get_or_create(page=page_assign_perms, name='Formulario de Asignación', slug='formulario-asignacion', operation_type='G', order=1)

    module_inventory, _ = Module.objects.get_or_create(name='Inventario', slug='inventario', order=3)
    page_products, _ = Page.objects.get_or_create(module=module_inventory, name='Gestión de Productos', slug='gestion-productos', order=1)
    tab_product_detail, _ = Tab.objects.get_or_create(page=page_products, name='Detalle de Producto', slug='detalle-producto', operation_type='I', order=1)

    op_ajover, _ = Operation.objects.get_or_create(name='Ajover', slug='ajover')
    op_exito, _ = Operation.objects.get_or_create(name='Exito', slug='exito')
    op_global, _ = Operation.objects.get_or_create(name='Global', slug='global') # Representing the 'Global' option

    # 4. Assign all 'can_view' permissions to testuser for all created tabs (globally)
    for tab in Tab.objects.all():
        UserPermission.objects.get_or_create(
            user_profile=profile,
            tab=tab,
            operation=None, # Global permission
            defaults={'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True}
        )
        UserPermission.objects.get_or_create(
            user_profile=profile,
            tab=tab,
            operation=op_ajover,
            defaults={'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True}
        )
        UserPermission.objects.get_or_create(
            user_profile=profile,
            tab=tab,
            operation=op_exito,
            defaults={'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True}
        )

    print('Test user, profile, maestras data, and permissions created/updated successfully.')

if __name__ == '__main__':
    run()