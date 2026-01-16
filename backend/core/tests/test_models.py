# ruta: backend/core/tests/test_models.py
"""
Tests unitarios para los modelos del módulo core.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from core.models import (
    Vehiculo, Conductor, Cliente, TipoVehiculo, Categoria,
    UnidadMedida, Articulo
)
from .fixtures import CoreTestFixtures

User = get_user_model()


class VehiculoModelTest(TestCase):
    """Tests para el modelo Vehiculo"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
        self.tipo_vehiculo = CoreTestFixtures.create_tipo_vehiculo(usuario=self.user)
    
    def test_create_vehiculo(self):
        """Test crear vehículo básico"""
        vehiculo = CoreTestFixtures.create_vehiculo("ABC123", "Owner Test", self.tipo_vehiculo, self.user)
        self.assertEqual(vehiculo.placa, "ABC123")
        self.assertEqual(vehiculo.propietario, "Owner Test")
        self.assertEqual(vehiculo.tipo_vehiculo, self.tipo_vehiculo)
        self.assertTrue(vehiculo.estado)
        self.assertFalse(vehiculo.eliminado)
    
    def test_vehiculo_str_representation(self):
        """Test representación en string"""
        vehiculo = CoreTestFixtures.create_vehiculo("XYZ789", usuario=self.user)
        self.assertIn("XYZ789", str(vehiculo))
    
    def test_placa_unique(self):
        """Test que placa es único"""
        CoreTestFixtures.create_vehiculo("UNIQUE123", usuario=self.user)
        with self.assertRaises(IntegrityError):
            CoreTestFixtures.create_vehiculo("UNIQUE123", usuario=self.user)
    
    def test_vehiculo_soft_delete(self):
        """Test que vehículo puede ser marcado como eliminado"""
        vehiculo = CoreTestFixtures.create_vehiculo(usuario=self.user)
        vehiculo.eliminado = True
        vehiculo.save()
        self.assertTrue(vehiculo.eliminado)


class ConductorModelTest(TestCase):
    """Tests para el modelo Conductor"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
    
    def test_create_conductor(self):
        """Test crear conductor básico"""
        conductor = CoreTestFixtures.create_conductor("1234567890", "Juan Pérez", self.user)
        self.assertEqual(conductor.cedula, "1234567890")
        self.assertEqual(conductor.nombre, "Juan Pérez")
        self.assertEqual(conductor.licencia, ["C1", "C2"])
        self.assertTrue(conductor.estado)
        self.assertFalse(conductor.eliminado)
    
    def test_conductor_str_representation(self):
        """Test representación en string"""
        conductor = CoreTestFixtures.create_conductor("9876543210", "Pedro López", self.user)
        self.assertIn("Pedro López", str(conductor))
    
    def test_cedula_unique(self):
        """Test que cedula es único"""
        CoreTestFixtures.create_conductor("1111111111", usuario=self.user)
        with self.assertRaises(IntegrityError):
            CoreTestFixtures.create_conductor("1111111111", usuario=self.user)
    
    def test_licencia_json_field(self):
        """Test que licencia es un JSONField"""
        conductor = Conductor.objects.create(
            cedula="5555555555",
            nombre="Test Driver",
            celular="3001234567",
            licencia=["A1", "A2", "B1"],
            usuario_creacion=self.user
        )
        self.assertIsInstance(conductor.licencia, list)
        self.assertEqual(len(conductor.licencia), 3)


class ClienteModelTest(TestCase):
    """Tests para el modelo Cliente"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
        self.estado = CoreTestFixtures.create_master_estado(usuario=self.user)
    
    def test_create_cliente(self):
        """Test crear cliente básico"""
        cliente = CoreTestFixtures.create_cliente("Cliente Test", self.estado, self.user)
        self.assertEqual(cliente.nombre, "Cliente Test")
        self.assertEqual(cliente.estado, self.estado)
        self.assertFalse(cliente.eliminado)
    
    def test_cliente_str_representation(self):
        """Test representación en string"""
        cliente = CoreTestFixtures.create_cliente("Test Client", self.estado, self.user)
        self.assertIn("Test Client", str(cliente))
    
    def test_cliente_with_logo(self):
        """Test que cliente puede tener logo"""
        cliente = CoreTestFixtures.create_cliente(usuario=self.user)
        self.assertIsNotNone(cliente.logo)


class TipoVehiculoModelTest(TestCase):
    """Tests para el modelo TipoVehiculo"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
    
    def test_create_tipo_vehiculo(self):
        """Test crear tipo de vehículo"""
        tipo = CoreTestFixtures.create_tipo_vehiculo("Camión", self.user)
        self.assertEqual(tipo.descripcion, "Camión")
        self.assertTrue(tipo.estado)
        self.assertFalse(tipo.eliminado)
    
    def test_descripcion_unique(self):
        """Test que descripcion es único"""
        CoreTestFixtures.create_tipo_vehiculo("Único", self.user)
        with self.assertRaises(IntegrityError):
            CoreTestFixtures.create_tipo_vehiculo("Único", self.user)


class CategoriaModelTest(TestCase):
    """Tests para el modelo Categoria"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
    
    def test_create_categoria(self):
        """Test crear categoría"""
        categoria = CoreTestFixtures.create_categoria("Herramientas", self.user)
        self.assertEqual(categoria.descripcion, "Herramientas")
        self.assertTrue(categoria.estado)
        self.assertFalse(categoria.eliminado)
    
    def test_categoria_str_representation(self):
        """Test representación en string"""
        categoria = CoreTestFixtures.create_categoria("Test Category", self.user)
        self.assertIn("Test Category", str(categoria))
    
    def test_descripcion_unique(self):
        """Test que descripcion es único"""
        CoreTestFixtures.create_categoria("Única", self.user)
        with self.assertRaises(IntegrityError):
            CoreTestFixtures.create_categoria("Única", self.user)


class UnidadMedidaModelTest(TestCase):
    """Tests para el modelo UnidadMedida"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
    
    def test_create_unidad_medida(self):
        """Test crear unidad de medida"""
        unidad = CoreTestFixtures.create_unidad_medida("Kilogramo", "kg", self.user)
        self.assertEqual(unidad.descripcion, "Kilogramo")
        self.assertEqual(unidad.abreviatura, "kg")
        self.assertTrue(unidad.estado)
    
    def test_unidad_medida_str_representation(self):
        """Test representación en string"""
        unidad = CoreTestFixtures.create_unidad_medida("Metro", "m", self.user)
        self.assertIn("Metro", str(unidad))
    
    def test_abreviatura_opcional(self):
        """Test que abreviatura es opcional"""
        unidad = UnidadMedida.objects.create(
            descripcion="Sin Abreviatura",
            usuario_creacion=self.user
        )
        self.assertIsNone(unidad.abreviatura)


class ArticuloModelTest(TestCase):
    """Tests para el modelo Articulo"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
        self.categoria = CoreTestFixtures.create_categoria(usuario=self.user)
        self.unidad_medida = CoreTestFixtures.create_unidad_medida(usuario=self.user)
    
    def test_create_articulo(self):
        """Test crear artículo"""
        articulo = CoreTestFixtures.create_articulo(
            "ART001", "Martillo", self.categoria, self.unidad_medida, self.user
        )
        self.assertEqual(articulo.codigo, "ART001")
        self.assertEqual(articulo.descripcion, "Martillo")
        self.assertEqual(articulo.categoria, self.categoria)
        self.assertEqual(articulo.unidad_medida_general, self.unidad_medida)
        self.assertTrue(articulo.estado)
        self.assertFalse(articulo.eliminado)
    
    def test_articulo_str_representation(self):
        """Test representación en string"""
        articulo = CoreTestFixtures.create_articulo(
            "TEST001", "Test Article", self.categoria, self.unidad_medida, self.user
        )
        self.assertIn("Test Article", str(articulo))
    
    def test_codigo_opcional(self):
        """Test que codigo es opcional"""
        articulo = Articulo.objects.create(
            descripcion="Sin Código",
            unidad_medida_general=self.unidad_medida,
            categoria=self.categoria,
            usuario_creacion=self.user
        )
        self.assertIsNone(articulo.codigo)
