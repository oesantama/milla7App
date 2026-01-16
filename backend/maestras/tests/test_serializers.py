# ruta: backend/maestras/tests/test_serializers.py
"""
Tests para los serializers del módulo maestras.
"""
from django.test import TestCase
from maestras.models import Modulo, Pagina, Tab, Rol
from maestras.serializers import (
    ModuloSerializer, PaginaSerializer, TabSerializer, RolSerializer,
    MasterEstadoSerializer, TipoNotificacionSerializer
)
from .fixtures import MaestrasTestFixtures


class ModuloSerializerTest(TestCase):
    """Tests para ModuloSerializer"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
    
    def test_serialize_modulo_with_paginas(self):
        """Test serialización con páginas anidadas"""
        modulo = MaestrasTestFixtures.create_modulo("Test", usuario=self.user)
        pagina = MaestrasTestFixtures.create_pagina(modulo, "Página 1", usuario=self.user)
        
        serializer = ModuloSerializer(modulo)
        data = serializer.data
        
        self.assertEqual(data['descripcion_modulo'], "Test")
        self.assertIn('paginas', data)
        self.assertEqual(len(data['paginas']), 1)
    
    def test_deserialize_valid_data(self):
        """Test deserialización de datos válidos"""
        data = {
            'descripcion_modulo': 'Nuevo Módulo',
            'order': 1,
            'es_expansivo': True,
            'route': '/nuevo-modulo',
            'estado': True
        }
        serializer = ModuloSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_required_fields(self):
        """Test que campos requeridos fallan si no están"""
        data = {'order': 1}
        serializer = ModuloSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('descripcion_modulo', serializer.errors)


class PaginaSerializerTest(TestCase):
    """Tests para PaginaSerializer"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
        self.modulo = MaestrasTestFixtures.create_modulo(usuario=self.user)
    
    def test_serialize_pagina_with_tabs(self):
        """Test serialización con tabs anidados"""
        pagina = MaestrasTestFixtures.create_pagina(self.modulo, "Test", usuario=self.user)
        tab = MaestrasTestFixtures.create_tab(pagina, "Tab 1", self.user)
        
        serializer = PaginaSerializer(pagina)
        data = serializer.data
        
        self.assertEqual(data['descripcion_pages'], "Test")
        self.assertIn('tabs', data)
        self.assertEqual(len(data['tabs']), 1)


class TabSerializerTest(TestCase):
    """Tests para TabSerializer"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
        self.modulo = MaestrasTestFixtures.create_modulo(usuario=self.user)
        self.pagina = MaestrasTestFixtures.create_pagina(self.modulo, usuario=self.user)
    
    def test_serialize_tab(self):
        """Test serialización de tab"""
        tab = MaestrasTestFixtures.create_tab(self.pagina, "Test Tab", self.user)
        
        serializer = TabSerializer(tab)
        data = serializer.data
        
        self.assertEqual(data['descripcion_tabs'], "Test Tab")
        self.assertIn('id_tab', data)
        self.assertIn('estado', data)


class RolSerializerTest(TestCase):
    """Tests para RolSerializer"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
    
    def test_serialize_rol(self):
        """Test serialización de rol"""
        rol = MaestrasTestFixtures.create_rol("Admin", self.user)
        
        serializer = RolSerializer(rol)
        data = serializer.data
        
        self.assertEqual(data['descripcion_rol'], "Admin")
        self.assertIn('id_rol', data)
        self.assertIn('estado', data)


class MasterEstadoSerializerTest(TestCase):
    """Tests para MasterEstadoSerializer"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
    
    def test_serialize_master_estado(self):
        """Test serialización de estado maestro"""
        estado = MaestrasTestFixtures.create_master_estado("Activo", self.user)
        
        serializer = MasterEstadoSerializer(estado)
        data = serializer.data
        
        self.assertEqual(data['descripcion'], "Activo")
        self.assertIn('id', data)


class TipoNotificacionSerializerTest(TestCase):
    """Tests para TipoNotificacionSerializer"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
    
    def test_serialize_tipo_notificacion(self):
        """Test serialización de tipo de notificación"""
        tipo = MaestrasTestFixtures.create_tipo_notificacion("Email", "Test", self.user)
        
        serializer = TipoNotificacionSerializer(tipo)
        data = serializer.data
        
        self.assertEqual(data['nombre'], "Email")
        self.assertEqual(data['descripcion'], "Test")
