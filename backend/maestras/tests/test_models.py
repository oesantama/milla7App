# ruta: backend/maestras/tests/test_models.py
"""
Tests unitarios para los modelos del módulo maestras.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from maestras.models import (
    Modulo, Pagina, Tab, Rol, PermisoPorRol, PermisoPorUsuario,
    MasterEstado, TipoNotificacion
)
from .fixtures import MaestrasTestFixtures

User = get_user_model()


class ModuloModelTest(TestCase):
    """Tests para el modelo Modulo"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
    
    def test_create_modulo(self):
        """Test crear módulo básico"""
        modulo = MaestrasTestFixtures.create_modulo("Gestión", 1, self.user)
        self.assertEqual(modulo.descripcion_modulo, "Gestión")
        self.assertEqual(modulo.order, 1)
        self.assertTrue(modulo.estado)
        self.assertEqual(modulo.usuario_creacion, self.user)
    
    def test_modulo_str_representation(self):
        """Test representación en string"""
        modulo = MaestrasTestFixtures.create_modulo("Test Module", usuario=self.user)
        self.assertEqual(str(modulo), "Test Module")
    
    def test_descripcion_unique(self):
        """Test que descripcion_modulo es único"""
        MaestrasTestFixtures.create_modulo("Único", usuario=self.user)
        with self.assertRaises(IntegrityError):
            MaestrasTestFixtures.create_modulo("Único", usuario=self.user)
    
    def test_modulo_ordering(self):
        """Test ordenamiento por campo order"""
        modulo1 = MaestrasTestFixtures.create_modulo("Módulo 1", 2, self.user)
        modulo2 = MaestrasTestFixtures.create_modulo("Módulo 2", 1, self.user)
        modulos = list(Modulo.objects.all())
        self.assertEqual(modulos[0], modulo2)
        self.assertEqual(modulos[1], modulo1)
    
    def test_timestamps_auto_populate(self):
        """Test que fecha_creacion se auto-completa"""
        modulo = MaestrasTestFixtures.create_modulo(usuario=self.user)
        self.assertIsNotNone(modulo.fecha_creacion)
        self.assertIsNotNone(modulo.fecha_modificacion)


class PaginaModelTest(TestCase):
    """Tests para el modelo Pagina"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
        self.modulo = MaestrasTestFixtures.create_modulo(usuario=self.user)
    
    def test_create_pagina(self):
        """Test crear página básica"""
        pagina = MaestrasTestFixtures.create_pagina(self.modulo, "Usuarios", usuario=self.user)
        self.assertEqual(pagina.descripcion_pages, "Usuarios")
        self.assertEqual(pagina.modulo, self.modulo)
        self.assertTrue(pagina.estado)
    
    def test_pagina_str_representation(self):
        """Test representación en string"""
        pagina = MaestrasTestFixtures.create_pagina(self.modulo, "Test Page", usuario=self.user)
        expected = f"{self.modulo.descripcion_modulo} > Test Page"
        self.assertEqual(str(pagina), expected)
    
    def test_unique_together_modulo_descripcion(self):
        """Test que modulo + descripcion_pages es único"""
        MaestrasTestFixtures.create_pagina(self.modulo, "Página Única", usuario=self.user)
        with self.assertRaises(IntegrityError):
            MaestrasTestFixtures.create_pagina(self.modulo, "Página Única", usuario=self.user)


class TabModelTest(TestCase):
    """Tests para el modelo Tab"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
        self.modulo = MaestrasTestFixtures.create_modulo(usuario=self.user)
        self.pagina = MaestrasTestFixtures.create_pagina(self.modulo, usuario=self.user)
    
    def test_create_tab(self):
        """Test crear tab básico"""
        tab = MaestrasTestFixtures.create_tab(self.pagina, "Listado", self.user)
        self.assertEqual(tab.descripcion_tabs, "Listado")
        self.assertEqual(tab.pagina, self.pagina)
        self.assertTrue(tab.estado)
    
    def test_tab_str_representation(self):
        """Test representación en string"""
        tab = MaestrasTestFixtures.create_tab(self.pagina, "Test Tab", self.user)
        expected = f"{self.pagina.descripcion_pages} > Test Tab"
        self.assertEqual(str(tab), expected)


class RolModelTest(TestCase):
    """Tests para el modelo Rol"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
    
    def test_create_rol(self):
        """Test crear rol básico"""
        rol = MaestrasTestFixtures.create_rol("Admin", self.user)
        self.assertEqual(rol.descripcion_rol, "Admin")
        self.assertTrue(rol.estado)
    
    def test_rol_str_representation(self):
        """Test representación en string"""
        rol = MaestrasTestFixtures.create_rol("Test Role", self.user)
        self.assertEqual(str(rol), "Test Role")
    
    def test_descripcion_unique(self):
        """Test que descripcion_rol es único"""
        MaestrasTestFixtures.create_rol("Único", self.user)
        with self.assertRaises(IntegrityError):
            MaestrasTestFixtures.create_rol("Único", self.user)


class PermisoPorRolModelTest(TestCase):
    """Tests para el modelo PermisoPorRol"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
        # No usamos create_full_menu_structure para evitar crear el permiso automáticamente
        self.modulo = MaestrasTestFixtures.create_modulo(usuario=self.user)
        self.pagina = MaestrasTestFixtures.create_pagina(self.modulo, usuario=self.user)
        self.tab = MaestrasTestFixtures.create_tab(self.pagina, usuario=self.user)
        self.rol = MaestrasTestFixtures.create_rol("Rol Test", usuario=self.user)
    
    def test_create_permiso_por_rol(self):
        """Test crear permiso por rol"""
        permiso = MaestrasTestFixtures.create_permiso_por_rol(
            self.rol, self.tab, ver=True, crear=True, usuario=self.user
        )
        self.assertTrue(permiso.ver)
        self.assertTrue(permiso.crear)
        self.assertFalse(permiso.editar)
        self.assertFalse(permiso.borrar)
    
    def test_permiso_str_representation(self):
        """Test representación en string"""
        permiso = MaestrasTestFixtures.create_permiso_por_rol(
            self.rol, self.tab, usuario=self.user
        )
        expected = f"Rol: {self.rol.descripcion_rol} | Tab: {self.tab.descripcion_tabs}"
        self.assertEqual(str(permiso), expected)


class MasterEstadoModelTest(TestCase):
    """Tests para el modelo MasterEstado"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
    
    def test_create_master_estado(self):
        """Test crear estado maestro"""
        estado = MaestrasTestFixtures.create_master_estado("Activo", self.user)
        self.assertEqual(estado.descripcion, "Activo")
        self.assertTrue(estado.estado)
    
    def test_master_estado_str_representation(self):
        """Test representación en string"""
        estado = MaestrasTestFixtures.create_master_estado("Test Estado", self.user)
        self.assertIn("Test Estado", str(estado))
    
    def test_descripcion_unique(self):
        """Test que descripcion es único"""
        MaestrasTestFixtures.create_master_estado("Único", self.user)
        with self.assertRaises(IntegrityError):
            MaestrasTestFixtures.create_master_estado("Único", self.user)


class TipoNotificacionModelTest(TestCase):
    """Tests para el modelo TipoNotificacion"""
    
    def setUp(self):
        self.user = MaestrasTestFixtures.create_test_user()
    
    def test_create_tipo_notificacion(self):
        """Test crear tipo de notificación"""
        tipo = MaestrasTestFixtures.create_tipo_notificacion(
            "Email", "Notificación por correo", self.user
        )
        self.assertEqual(tipo.nombre, "Email")
        self.assertEqual(tipo.descripcion, "Notificación por correo")
    
    def test_tipo_notificacion_str_representation(self):
        """Test representación en string"""
        tipo = MaestrasTestFixtures.create_tipo_notificacion("Test Type", usuario=self.user)
        self.assertEqual(str(tipo), "Test Type")
    
    def test_descripcion_opcional(self):
        """Test que descripcion es opcional"""
        tipo = TipoNotificacion.objects.create(
            nombre="Sin Descripción",
            usuario_creacion=self.user
        )
        self.assertIsNone(tipo.descripcion)
