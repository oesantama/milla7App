# backend/users/management/commands/inspect_user_perms.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import UserProfile
from maestras.models import PermisoPorUsuario

User = get_user_model()

class Command(BaseCommand):
    help = 'Inspects the permissions of a given user.'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='The username to inspect.')

    def handle(self, *args, **options):
        username = options['username']
        self.stdout.write(self.style.SUCCESS(f"--- Inspecting permissions for user: {username} ---"))

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"User '{username}' does not exist."))
            return

        # 1. Check basic user attributes
        self.stdout.write(self.style.HTTP_INFO(f"Username: {user.username}"))
        self.stdout.write(self.style.HTTP_INFO(f"Is Superuser: {user.is_superuser}"))
        self.stdout.write(self.style.HTTP_INFO(f"Is Staff: {user.is_staff}"))

        # 2. Check UserProfile
        try:
            profile = UserProfile.objects.get(user=user)
            self.stdout.write(self.style.HTTP_INFO(f"Profile Role: {profile.role}"))
        except UserProfile.DoesNotExist:
            self.stdout.write(self.style.WARNING("No UserProfile found for this user."))

        # 3. Check direct permissions from PermisoPorUsuario
        user_permissions = PermisoPorUsuario.objects.filter(usuario=user)
        permission_count = user_permissions.count()

        self.stdout.write(self.style.SUCCESS(f"\nFound {permission_count} direct permission entries in 'PermisoPorUsuario' table."))

        if permission_count > 0:
            view_perms = user_permissions.filter(ver=True)
            self.stdout.write(f"  - {view_perms.count()} entries have 'ver' (view) set to True.")
            
            self.stdout.write("\n--- Tabs with VIEW access ---")
            if view_perms.exists():
                for perm in view_perms.select_related('tab', 'tab__pagina', 'tab__pagina__modulo'):
                    tab = perm.tab
                    path = f"{tab.pagina.modulo.descripcion_modulo} -> {tab.pagina.descripcion_pages} -> {tab.descripcion_tabs}"
                    self.stdout.write(f"  - {path}")
            else:
                self.stdout.write("  None.")
        
        self.stdout.write(self.style.SUCCESS("\n--- Inspection Complete ---"))
