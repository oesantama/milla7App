# ruta: backend/core/tests/test_serializers.py
"""
Tests para los serializers del módulo core.
"""
from django.test import TestCase
from core.models import Vehiculo, Conductor, Cliente, Categoria, Articulo
from core.serializers import (
    VehiculoSerializer, ConductorSerializer, ClienteSerializer,
    CategoriaSerializer, ArticuloSerializer, UnidadMedidaSerializer
)
from .fixtures import CoreTestFixtures


class VehiculoSerializerTest(TestCase):
    """Tests para VehiculoSerializer"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
        self.tipo_vehiculo = CoreTestFixtures.create_tipo_vehiculo(usuario=self.user)
    
    def test_serialize_vehiculo(self):
        """Test serialización de vehículo"""
        vehiculo = CoreTestFixtures.create_vehiculo("ABC123", usuario=self.user)
        
        serializer = VehiculoSerializer(vehiculo)
        data = serializer.data
        
        self.assertEqual(data['placa'], "ABC123")
        self.assertIn('tipo_vehiculo', data)
        self.assertIn('propietario', data)
    
    def test_deserialize_valid_data(self):
        """Test deserialización de datos válidos"""
        data = {
            'placa': 'NEW123',
            'propietario': 'Test Owner',
            'cubicaje': 50.00,
            'marca': 'Toyota',
            'modelo': 'Hilux',
            'año': 2023,
            'tipo_vehiculo': self.tipo_vehiculo.id
        }
        serializer = VehiculoSerializer(data=data)
        self.assertTrue(serializer.is_valid())


class ConductorSerializerTest(TestCase):
    """Tests para ConductorSerializer"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
    
    def test_serialize_conductor_with_licencias(self):
        """Test serialización de conductor con JSONField"""
        conductor = CoreTestFixtures.create_conductor("1234567890", usuario=self.user)
        
        serializer = ConductorSerializer(conductor)
        data = serializer.data
        
        self.assertEqual(data['cedula'], "1234567890")
        self.assertEqual(data['licencia'], ["C1", "C2"])
    
    def test_deserialize_conductor_with_licencias(self):
        """Test deserialización con licencias"""
        data = {
            'cedula': '9999999999',
            'nombre': 'Test Driver',
            'celular': '3001234567',
            'licencia': ['A1', 'B1', 'C1']
        }
        serializer = ConductorSerializer(data=data)
        self.assertTrue(serializer.is_valid())


class ClienteSerializerTest(TestCase):
    """Tests para ClienteSerializer"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
        self.estado = CoreTestFixtures.create_master_estado(usuario=self.user)
    
    def test_serialize_cliente_with_logo(self):
        """Test serialización de cliente con logo"""
        cliente = CoreTestFixtures.create_cliente("Test Client", self.estado, self.user)
        
        serializer = ClienteSerializer(cliente)
        data = serializer.data
        
        self.assertEqual(data['nombre'], "Test Client")
        self.assertIn('logo', data)


class CategoriaSerializerTest(TestCase):
    """Tests para CategoriaSerializer"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
    
    def test_serialize_categoria(self):
        """Test serialización de categoría"""
        categoria = CoreTestFixtures.create_categoria("Test", self.user)
        
        serializer = CategoriaSerializer(categoria)
        data = serializer.data
        
        self.assertEqual(data['descripcion'], "Test")
        self.assertIn('estado', data)


class UnidadMedidaSerializerTest(TestCase):
    """Tests para UnidadMedidaSerializer"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
    
    def test_serialize_unidad_medida(self):
        """Test serialización de unidad de medida"""
        unidad = CoreTestFixtures.create_unidad_medida("Kilogramo", "kg", self.user)
        
        serializer = UnidadMedidaSerializer(unidad)
        data = serializer.data
        
        self.assertEqual(data['descripcion'], "Kilogramo")
        self.assertEqual(data['abreviatura'], "kg")


class ArticuloSerializerTest(TestCase):
    """Tests para ArticuloSerializer"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
        self.categoria = CoreTestFixtures.create_categoria(usuario=self.user)
        self.unidad = CoreTestFixtures.create_unidad_medida(usuario=self.user)
    
    def test_serialize_articulo_with_relations(self):
        """Test serialización de artículo con relaciones"""
        articulo = CoreTestFixtures.create_articulo(
            "ART001", "Test", self.categoria, self.unidad, self.user
        )
        
        serializer = ArticuloSerializer(articulo)
        data = serializer.data
        
        self.assertEqual(data['codigo'], "ART001")
        self.assertIn('categoria', data)
        self.assertIn('unidad_medida_general', data)
