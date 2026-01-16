# ruta: backend/core/tests/test_views.py
"""
Tests para los endpoints de API del módulo core.
"""
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from core.models import Vehiculo, Conductor, Cliente, Categoria, Articulo
from .fixtures import CoreTestFixtures

User = get_user_model()


class VehiculoAPITest(APITestCase):
    """Tests para VehiculoViewSet"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
        self.client.force_authenticate(user=self.user)
        self.tipo_vehiculo = CoreTestFixtures.create_tipo_vehiculo(usuario=self.user)
    
    def test_list_vehiculos_excludes_deleted(self):
        """Test que listar vehículos excluye eliminados"""
        v1 = CoreTestFixtures.create_vehiculo("ACTIVE1", usuario=self.user)
        v2 = CoreTestFixtures.create_vehiculo("DELETED1", usuario=self.user)
        v2.eliminado = True
        v2.save()
        
        url = '/api/core/vehiculos/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Debería devolver solo el vehículo activo
        placas = [v['placa'] for v in response.data]
        self.assertIn("ACTIVE1", placas)
        self.assertNotIn("DELETED1", placas)
    
    def test_create_vehiculo(self):
        """Test crear vehículo"""
        url = '/api/core/vehiculos/'
        data = {
            'placa': 'NEW123',
            'propietario': 'New Owner',
            'cubicaje': 45.00,
            'marca': 'Ford',
            'modelo': 'Ranger',
            'año': 2024,
            'tipo_vehiculo': self.tipo_vehiculo.id
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Vehiculo.objects.filter(eliminado=False).count(), 1)
    
    def test_retrieve_vehiculo_by_placa(self):
        """Test obtener vehículo por placa"""
        vehiculo = CoreTestFixtures.create_vehiculo("TEST123", usuario=self.user)
        url = '/api/core/vehiculos/TEST123/'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['placa'], "TEST123")
    
    def test_update_vehiculo(self):
        """Test actualizar vehículo"""
        vehiculo = CoreTestFixtures.create_vehiculo("UPDATE123", usuario=self.user)
        url = '/api/core/vehiculos/UPDATE123/'
        data = {
            'placa': 'UPDATE123',
            'propietario': 'Updated Owner',
            'cubicaje': 60.00,
            'marca': 'Updated',
            'modelo': 'Model',
            'año': 2025,
            'tipo_vehiculo': self.tipo_vehiculo.id
        }
        
        response = self.client.put(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        vehiculo.refresh_from_db()
        self.assertEqual(vehiculo.propietario, 'Updated Owner')
    
    def test_delete_vehiculo_soft_delete(self):
        """Test que DELETE hace soft delete"""
        vehiculo = CoreTestFixtures.create_vehiculo("DELETE123", usuario=self.user)
        url = '/api/core/vehiculos/DELETE123/'
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        vehiculo.refresh_from_db()
        self.assertTrue(vehiculo.eliminado)


class ConductorAPITest(APITestCase):
    """Tests para ConductorViewSet"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
        self.client.force_authenticate(user=self.user)
    
    def test_list_conductores_excludes_deleted(self):
        """Test que listar conductores excluye eliminados"""
        c1 = CoreTestFixtures.create_conductor("1111111111", usuario=self.user)
        c2 = CoreTestFixtures.create_conductor("2222222222", usuario=self.user)
        c2.eliminado = True
        c2.save()
        
        url = '/api/core/conductores/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cedulas = [c['cedula'] for c in response.data]
        self.assertIn("1111111111", cedulas)
        self.assertNotIn("2222222222", cedulas)
    
    def test_create_conductor_with_licencias(self):
        """Test crear conductor con licencias JSON"""
        url = '/api/core/conductores/'
        data = {
            'cedula': '3333333333',
            'nombre': 'Test Driver',
            'celular': '3001234567',
            'licencia': ['C1', 'C2', 'C3']
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        conductor = Conductor.objects.get(cedula='3333333333')
        self.assertEqual(conductor.licencia, ['C1', 'C2', 'C3'])
    
    def test_retrieve_conductor_by_cedula(self):
        """Test obtener conductor por cédula"""
        conductor = CoreTestFixtures.create_conductor("4444444444", usuario=self.user)
        url = '/api/core/conductores/4444444444/'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['cedula'], "4444444444")


class ClienteAPITest(APITestCase):
    """Tests para ClienteViewSet"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
        self.client.force_authenticate(user=self.user)
        self.estado = CoreTestFixtures.create_master_estado(usuario=self.user)
    
    def test_list_clientes_excludes_deleted(self):
        """Test que listar clientes excluye eliminados"""
        c1 = CoreTestFixtures.create_cliente("Cliente 1", self.estado, self.user)
        c2 = CoreTestFixtures.create_cliente("Cliente 2", self.estado, self.user)
        c2.eliminado = True
        c2.save()
        
        url = '/api/core/clientes/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        nombres = [c['nombre'] for c in response.data]
        self.assertIn("Cliente 1", nombres)
        self.assertNotIn("Cliente 2", nombres)


class CategoriaAPITest(APITestCase):
    """Tests para CategoriaViewSet"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
        self.client.force_authenticate(user=self.user)
    
    def test_list_categorias(self):
        """Test listar categorías"""
        CoreTestFixtures.create_categoria("Cat 1", self.user)
        CoreTestFixtures.create_categoria("Cat 2", self.user)
        
        url = '/api/core/categorias/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_delete_categoria_soft_delete(self):
        """Test que DELETE hace soft delete en categoría"""
        categoria = CoreTestFixtures.create_categoria("Test", self.user)
        url = f'/api/core/categorias/{categoria.id}/'
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        categoria.refresh_from_db()
        self.assertTrue(categoria.eliminado)


class ArticuloAPITest(APITestCase):
    """Tests para ArticuloViewSet"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
        self.client.force_authenticate(user=self.user)
        self.categoria = CoreTestFixtures.create_categoria(usuario=self.user)
        self.unidad = CoreTestFixtures.create_unidad_medida(usuario=self.user)
    
    def test_create_articulo_with_relations(self):
        """Test crear artículo con relaciones"""
        url = '/api/core/articulos/'
        data = {
            'codigo': 'ART999',
            'descripcion': 'Test Article',
            'unidad_medida_general': self.unidad.id,
            'categoria': self.categoria.id
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        articulo = Articulo.objects.get(codigo='ART999')
        self.assertEqual(articulo.categoria, self.categoria)
        self.assertEqual(articulo.unidad_medida_general, self.unidad)
