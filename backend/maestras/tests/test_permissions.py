# ruta: backend/maestras/tests/test_permissions.py
"""
Tests específicos de permisos para el módulo maestras.
"""
from django.test import TestCase
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from maestras.models import PermisoPorRol, PermisoPorUsuario
from .fixtures import MaestrasTestFixtures

User = get_user_model()


class PermisoPorRolTest(TestCase):
    """Tests para permisos por rol"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
        structure = MaestrasTestFixtures.create_full_menu_structure(self.user)
        self.rol = structure['rol']
        self.tab = structure['tab']
    
    def test_create_permiso_with_all_permissions(self):
        """Test crear permiso con todos los permisos"""
        permiso = MaestrasTestFixtures.create_permiso_por_rol(
            self.rol, self.tab, ver=True, crear=True, editar=True, borrar=True, usuario=self.user
        )
        
        self.assertTrue(permiso.ver)
        self.assertTrue(permiso.crear)
        self.assertTrue(permiso.editar)
        self.assertTrue(permiso.borrar)
    
    def test_create_permiso_with_partial_permissions(self):
        """Test crear permiso con permisos parciales"""
        permiso = MaestrasTestFixtures.create_permiso_por_rol(
            self.rol, self.tab, ver=True, crear=False, editar=True, borrar=False, usuario=self.user
        )
        
        self.assertTrue(permiso.ver)
        self.assertFalse(permiso.crear)
        self.assertTrue(permiso.editar)
        self.assertFalse(permiso.borrar)
    
    def test_unique_together_rol_tab(self):
        """Test que rol + tab es único"""
        MaestrasTestFixtures.create_permiso_por_rol(self.rol, self.tab, usuario=self.user)
        
        # Intentar crear duplicado debería fallar
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            MaestrasTestFixtures.create_permiso_por_rol(self.rol, self.tab, usuario=self.user)


class PermisoPorUsuarioTest(TestCase):
    """Tests para permisos por usuario"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
        self.user2 = User.objects.create_user(username="user2", password="pass123")
        structure = MaestrasTestFixtures.create_full_menu_structure(self.user)
        self.tab = structure['tab']
    
    def test_create_permiso_por_usuario(self):
        """Test crear permiso por usuario"""
        permiso = MaestrasTestFixtures.create_permiso_por_usuario(
            self.user2, self.tab, ver=True, crear=True, usuario_creador=self.user
        )
        
        self.assertEqual(permiso.usuario, self.user2)
        self.assertEqual(permiso.tab, self.tab)
        self.assertTrue(permiso.ver)
        self.assertTrue(permiso.crear)
    
    def test_permiso_por_usuario_with_cliente(self):
        """Test permiso por usuario con cliente específico"""
        from core.models import Cliente
        from maestras.models import MasterEstado
        
        estado = MasterEstado.objects.create(descripcion="Activo", usuario_creacion=self.user)
        cliente = Cliente.objects.create(nombre="Cliente Test", estado=estado, usuario_creacion=self.user)
        
        permiso = MaestrasTestFixtures.create_permiso_por_usuario(
            self.user2, self.tab, cliente=cliente, ver=True, usuario_creador=self.user
        )
        
        self.assertEqual(permiso.cliente, cliente)
        self.assertIn(cliente.nombre, str(permiso))


class PermissionFilteringTest(APITestCase):
    """Tests para filtrado por permisos"""
    
    def setUp(self):
        self.admin_user = User.objects.create_user(username="admin", password="admin123")
        self.normal_user = User.objects.create_user(username="normal", password="normal123")
        
        # Crear estructura de menú
        structure = MaestrasTestFixtures.create_full_menu_structure(self.admin_user)
        self.rol_admin = structure['rol']
        self.tab = structure['tab']
        
        # Crear rol normal con permisos limitados
        self.rol_normal = MaestrasTestFixtures.create_rol("Normal", self.admin_user)
        MaestrasTestFixtures.create_permiso_por_rol(
            self.rol_normal, self.tab, ver=True, crear=False, editar=False, borrar=False, usuario=self.admin_user
        )
    
    def test_user_with_full_permissions_can_access(self):
        """Test que usuario con permisos completos puede acceder"""
        # Asignar permiso completo
        permiso = PermisoPorRol.objects.filter(rol=self.rol_admin, tab=self.tab).first()
        self.assertTrue(permiso.ver)
        self.assertTrue(permiso.crear)
    
    def test_user_with_limited_permissions_has_restrictions(self):
        """Test que usuario con permisos limitados tiene restricciones"""
        permiso = PermisoPorRol.objects.filter(rol=self.rol_normal, tab=self.tab).first()
        self.assertTrue(permiso.ver)
        self.assertFalse(permiso.crear)
        self.assertFalse(permiso.editar)
        self.assertFalse(permiso.borrar)
