from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

from maestras.models import Module, Page, Tab, Operation
from users.models import UserProfile, UserPermission


class PermissionsEndpointTest(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='testuser', password='password')
        # Create profile
        UserProfile.objects.create(user=self.user, role='tester')

        # Create module/page/tab/operation
        module = Module.objects.create(name='Maestras', slug='maestras', order=1)
        page = Page.objects.create(module=module, name='Gestión de Operaciones', slug='gestion-operaciones', url_path='/gestion', order=1)
        tab = Tab.objects.create(page=page, name='Detalle de Operación', slug='detalle-operacion', operation_type='I', order=1)
        operation = Operation.objects.create(name='Ajover', slug='ajover')

        # Give the user a permission
        profile = self.user.profile
        UserPermission.objects.create(user_profile=profile, tab=tab, operation=operation, can_view=True, can_create=True)

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_permissions_endpoint_returns_structure(self):
        response = self.client.get(f'/api/users/{self.user.id}/permissions/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('modules', data)
        self.assertIn('operations', data)
        # modules should be a list with at least one module
        self.assertIsInstance(data['modules'], list)
        self.assertGreaterEqual(len(data['modules']), 1)
        # operations should be a list and contain our operation
        self.assertIsInstance(data['operations'], list)
        slugs = [op.get('slug') for op in data['operations']]
        self.assertIn('ajover', slugs)
