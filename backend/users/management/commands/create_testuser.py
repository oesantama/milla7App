from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import UserProfile
from maestras.models import Modulo, Pagina, Tab, Rol, PermisoPorUsuario

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a test user (testuser/testpassword) and sets up initial data.'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='testuser', help='Username for test user')
        parser.add_argument('--password', type=str, default='testpassword', help='Password for test user')
        parser.add_argument('--email', type=str, default='testuser@example.com', help='Email for test user')

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        email = options['email']

        self.stdout.write(self.style.SUCCESS(f"--- Iniciando configuración de entorno de prueba ---"))

        # 1. Crear Roles
        self.stdout.write(self.style.HTTP_INFO('→ Creando roles...'))
        roles_to_create = ['superuser', 'admin', 'inhouse', 'director']
        for role_name in roles_to_create:
            rol, created = Rol.objects.get_or_create(descripcion_rol=role_name)
            if created:
                self.stdout.write(f"  - Rol '{rol.descripcion_rol}' creado.")
        
        admin_role = Rol.objects.get(descripcion_rol='admin')
        self.stdout.write(self.style.SUCCESS('✓ Roles listos'))

        # 2. Create or get test user (NOT a superuser)
        self.stdout.write(self.style.HTTP_INFO(f'→ Configurando usuario de prueba: {username}'))
        user, created = User.objects.get_or_create(
            username=username, 
            defaults={'email': email, 'is_staff': True, 'is_superuser': False} # IMPORTANT: Not a superuser
        )
        user.set_password(password) # Set password regardless of creation
        user.save()
        
        if created:
            self.stdout.write(f'  - Usuario Creado: {username}')
        else:
            self.stdout.write(f'  - Usuario {username} ya existía, contraseña actualizada.')

        # 3. Create UserProfile and assign 'admin' role
        profile, created = UserProfile.objects.update_or_create(
            user=user,
            defaults={'role': admin_role, 'phone_number': '+1234567890'}
        )
        if created:
            self.stdout.write(f'  - Perfil de usuario creado con rol: {admin_role.descripcion_rol}')
        else:
            self.stdout.write(f'  - Perfil de usuario actualizado con rol: {admin_role.descripcion_rol}')

        self.stdout.write(self.style.SUCCESS('✓ Usuario de prueba listo'))

        # 4. Create Maestras data
        self.stdout.write(self.style.HTTP_INFO('→ Configurando datos maestros (módulos, páginas, tabs)...'))
        
        # Define structure
        menu_structure = {
            'Maestras': {
                'es_expansivo': True, # New field
                'order': 1,
                'route': '/maestras', # New route for the module
                'pages': {
                    'Items': {'order': 1, 'route': '/maestras/items', 'icon': 'fa-box'},
                    'Roles': {'order': 2, 'route': '/maestras/roles', 'icon': 'fa-users-cog'},
                    'Permisos': {'order': 3, 'route': '/maestras/permisos', 'icon': 'fa-shield-alt'},
                    'Usuarios': {'order': 4, 'route': '/maestras/usuarios', 'icon': 'fa-user'},
                    'Clientes': {'order': 5, 'route': '/maestras/clientes', 'icon': 'fa-address-card'}, # New page
                    'Vehiculos': {'order': 6, 'route': '/maestras/vehiculos', 'icon': 'fa-truck'}, # New page
                    'Conductores': {'order': 7, 'route': '/maestras/conductores', 'icon': 'fa-id-card'}, # New page
                }
            },
            'Operaciones': { # New module
                'es_expansivo': True,
                'order': 2,
                'route': '/operaciones', # New route for the module
                'pages': {
                    'Pedidos': {'order': 1, 'route': '/operaciones/pedidos', 'icon': 'fa-clipboard-list'},
                    'Despachos': {'order': 2, 'route': '/operaciones/despachos', 'icon': 'fa-shipping-fast'},
                }
            }
        }

        for modulo_name, modulo_data in menu_structure.items():
            modulo, _ = Modulo.objects.update_or_create(
                descripcion_modulo=modulo_name,
                defaults={
                    'order': modulo_data['order'],
                    'es_expansivo': modulo_data['es_expansivo'],
                    'route': modulo_data['route'] # Add this line
                }
            )
            for page_name, page_data in modulo_data['pages'].items():
                pagina, _ = Pagina.objects.update_or_create(
                    modulo=modulo,
                    descripcion_pages=page_name,
                    defaults={
                        'order': page_data['order'],
                        'route': page_data['route'],
                        'icono': page_data['icon']
                    }
                )
                # Create default tabs for each page
                Tab.objects.update_or_create(
                    pagina=pagina, 
                    descripcion_tabs='Consulta', 
                    defaults={'route': f'{pagina.route}/consulta', 'icono': 'fa-search'}
                )
                Tab.objects.update_or_create(
                    pagina=pagina, 
                    descripcion_tabs='Creacion', 
                    defaults={'route': f'{pagina.route}/creacion', 'icono': 'fa-plus'}
                )
        self.stdout.write(self.style.SUCCESS('✓ Datos maestros listos'))

        # 5. Assign full permissions to the test user
        self.stdout.write(self.style.HTTP_INFO(f'→ Asignando todos los permisos directos a {username}...'))
        permission_count = 0
        for tab in Tab.objects.all():
            perm, created = PermisoPorUsuario.objects.update_or_create(
                usuario=user,
                tab=tab,
                defaults={
                    'ver': True,
                    'crear': True,
                    'editar': True,
                    'borrar': True,
                    'estado': True
                }
            )
            if created:
                permission_count += 1
        
        self.stdout.write(f'  - Creados {permission_count} nuevos permisos. {Tab.objects.all().count() - permission_count} permisos actualizados.')
        self.stdout.write(self.style.SUCCESS(f'✓ Permisos asignados'))

        self.stdout.write(self.style.SUCCESS(f'\n✅ Configuración de prueba completada!'))
        self.stdout.write(f'   Username: {username}')
        self.stdout.write(f'   Password: {password}')
        self.stdout.write(f'   Rol: {admin_role.descripcion_rol} (No es Superusuario de Django)')