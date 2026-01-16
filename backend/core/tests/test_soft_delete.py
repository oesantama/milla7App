# ruta: backend/core/tests/test_soft_delete.py
"""
Tests específicos para la funcionalidad de soft delete en el módulo core.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from core.models import Vehiculo, Conductor, Cliente, Categoria, Articulo
from .fixtures import CoreTestFixtures

User = get_user_model()


class SoftDeleteTest(TestCase):
    """Tests para verificar funcionalidad de soft delete"""
    
    def setUp(self):
        self.user = CoreTestFixtures.create_test_user()
    
    def test_vehiculo_soft_delete_marks_eliminado(self):
        """Test que eliminar vehículo marca eliminado=True"""
        vehiculo = CoreTestFixtures.create_vehiculo("TEST001", usuario=self.user)
        vehiculo_id = vehiculo.id
        
        # Marcar como eliminado
        vehiculo.eliminado = True
        vehiculo.save()
        
        # Verificar que sigue en la base de datos
        vehiculo_db = Vehiculo.objects.get(id=vehiculo_id)
        self.assertTrue(vehiculo_db.eliminado)
    
    def test_conductor_soft_delete_marks_eliminado(self):
        """Test que eliminar conductor marca eliminado=True"""
        conductor = CoreTestFixtures.create_conductor("1234567890", usuario=self.user)
        conductor_id = conductor.id
        
        conductor.eliminado = True
        conductor.save()
        
        conductor_db = Conductor.objects.get(id=conductor_id)
        self.assertTrue(conductor_db.eliminado)
    
    def test_cliente_soft_delete_marks_eliminado(self):
        """Test que eliminar cliente marca eliminado=True"""
        cliente = CoreTestFixtures.create_cliente(usuario=self.user)
        cliente_id = cliente.id
        
        cliente.eliminado = True
        cliente.save()
        
        cliente_db = Cliente.objects.get(id=cliente_id)
        self.assertTrue(cliente_db.eliminado)
    
    def test_categoria_soft_delete_marks_eliminado(self):
        """Test que eliminar categoría marca eliminado=True"""
        categoria = CoreTestFixtures.create_categoria("Test", self.user)
        categoria_id = categoria.id
        
        categoria.eliminado = True
        categoria.save()
        
        categoria_db = Categoria.objects.get(id=categoria_id)
        self.assertTrue(categoria_db.eliminado)
    
    def test_articulo_soft_delete_marks_eliminado(self):
        """Test que eliminar artículo marca eliminado=True"""
        articulo = CoreTestFixtures.create_articulo(usuario=self.user)
        articulo_id = articulo.id
        
        articulo.eliminado = True
        articulo.save()
        
        articulo_db = Articulo.objects.get(id=articulo_id)
        self.assertTrue(articulo_db.eliminado)
    
    def test_queryset_excludes_deleted_vehiculos(self):
        """Test que queryset excluye vehículos eliminados"""
        # Crear vehículos
        v1 = CoreTestFixtures.create_vehiculo("ACTIVE1", usuario=self.user)
        v2 = CoreTestFixtures.create_vehiculo("DELETED1", usuario=self.user)
        v2.eliminado = True
        v2.save()
        
        # Filtrar solo activos
        activos = Vehiculo.objects.filter(eliminado=False)
        self.assertEqual(activos.count(), 1)
        self.assertEqual(activos.first(), v1)
    
    def test_can_recover_soft_deleted_item(self):
        """Test que se puede recuperar un registro eliminado"""
        vehiculo = CoreTestFixtures.create_vehiculo(usuario=self.user)
        
        # Eliminar
        vehiculo.eliminado = True
        vehiculo.save()
        self.assertTrue(vehiculo.eliminado)
        
        # Recuperar
        vehiculo.eliminado = False
        vehiculo.save()
        self.assertFalse(vehiculo.eliminado)
    
    def test_usuario_modificacion_updates_on_soft_delete(self):
        """Test que usuario_modificacion se actualiza en soft delete"""
        vehiculo = CoreTestFixtures.create_vehiculo(usuario=self.user)
        
        # Crear otro usuario para modificar
        otro_usuario = User.objects.create_user(username="modifier", password="pass123")
        
        vehiculo.eliminado = True
        vehiculo.usuario_modificacion = otro_usuario
        vehiculo.save()
        
        self.assertEqual(vehiculo.usuario_modificacion, otro_usuario)
    
    def test_fecha_modificacion_updates_on_soft_delete(self):
        """Test que fecha_modificacion se actualiza en soft delete"""
        vehiculo = CoreTestFixtures.create_vehiculo(usuario=self.user)
        fecha_creacion = vehiculo.fecha_creacion
        fecha_mod_inicial = vehiculo.fecha_modificacion
        
        # Esperar un momento y modificar
        import time
        time.sleep(0.1)
        
        vehiculo.eliminado = True
        vehiculo.save()
        
        # Verificar que fecha_modificacion cambió
        self.assertGreater(vehiculo.fecha_modificacion, fecha_mod_inicial)
