# ruta: backend/maestras/tests/test_views.py
"""
Tests para los endpoints de API del módulo maestras.
"""
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from maestras.models import Modulo, Rol, MasterEstado
from .fixtures import MaestrasTestFixtures

User = get_user_model()


class MasterEstadoAPITest(APITestCase):
    """Tests para MasterEstadoViewSet"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
        self.client.force_authenticate(user=self.user)
    
    def test_list_master_estados(self):
        """Test listar estados maestros"""
        MaestrasTestFixtures.create_master_estado("Activo", self.user)
        MaestrasTestFixtures.create_master_estado("Inactivo", self.user)
        
        url = '/api/maestras/master-estados/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_create_master_estado(self):
        """Test crear estado maestro"""
        url = '/api/maestras/master-estados/'
        data = {'descripcion': 'Nuevo Estado'}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MasterEstado.objects.count(), 1)
    
    def test_retrieve_master_estado(self):
        """Test obtener detalle de estado maestro"""
        estado = MaestrasTestFixtures.create_master_estado("Test", self.user)
        url = f'/api/maestras/master-estados/{estado.id}/'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['descripcion'], "Test")
    
    def test_update_master_estado(self):
        """Test actualizar estado maestro"""
        estado = MaestrasTestFixtures.create_master_estado("Original", self.user)
        url = f'/api/maestras/master-estados/{estado.id}/'
        data = {'descripcion': 'Actualizado'}
        
        response = self.client.put(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        estado.refresh_from_db()
        self.assertEqual(estado.descripcion, 'Actualizado')
    
    def test_delete_master_estado(self):
        """Test eliminar estado maestro"""
        estado = MaestrasTestFixtures.create_master_estado("Test", self.user)
        url = f'/api/maestras/master-estados/{estado.id}/'
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(MasterEstado.objects.count(), 0)


class ModuloAPITest(APITestCase):
    """Tests para ModuloViewSet"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
        self.client.force_authenticate(user=self.user)
    
    def test_list_modulos_authenticated(self):
        """Test listar módulos con autenticación"""
        MaestrasTestFixtures.create_modulo("Módulo 1", usuario=self.user)
        MaestrasTestFixtures.create_modulo("Módulo 2", usuario=self.user)
        
        url = '/api/maestras/modulos/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_admin_tree_returns_full_structure(self):
        """Test que admin_tree devuelve estructura completa"""
        structure = MaestrasTestFixtures.create_full_menu_structure(self.user)
        
        url = '/api/maestras/modulos/admin_tree/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_create_modulo_requires_authentication(self):
        """Test que crear módulo requiere autenticación"""
        self.client.force_authenticate(user=None)
        
        url = '/api/maestras/modulos/'
        data = {'descripcion_modulo': 'Nuevo', 'order': 1}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RolAPITest(APITestCase):
    """Tests para RolViewSet"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
        self.client.force_authenticate(user=self.user)
    
    def test_list_roles(self):
        """Test listar roles"""
        MaestrasTestFixtures.create_rol("Admin", self.user)
        MaestrasTestFixtures.create_rol("User", self.user)
        
        url = '/api/maestras/roles/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_get_rol_permisos(self):
        """Test obtener permisos de un rol"""
        structure = MaestrasTestFixtures.create_full_menu_structure(self.user)
        rol = structure['rol']
        
        url = f'/api/maestras/roles/{rol.id_rol}/permisos/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
