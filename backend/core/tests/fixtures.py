# ruta: backend/core/tests/fixtures.py
"""
Fixtures y datos de prueba reutilizables para tests del módulo core.
"""
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from core.models import (
    Vehiculo, Conductor, Cliente, TipoVehiculo, Categoria,
    UnidadMedida, Articulo
)
from maestras.models import MasterEstado

User = get_user_model()


class CoreTestFixtures:
    """Clase helper para crear datos de prueba del módulo core"""
    
    @staticmethod
    def create_test_user(username="testuser", password="testpass123"):
        """Crear usuario de prueba"""
        return User.objects.create_user(
            username=username,
            password=password,
            email=f"{username}@test.com"
        )
    
    @staticmethod
    def create_tipo_vehiculo(descripcion="Camión", usuario=None):
        """Crear tipo de vehículo de prueba"""
        return TipoVehiculo.objects.create(
            descripcion=descripcion,
            estado=True,
            eliminado=False,
            usuario_creacion=usuario
        )
    
    @staticmethod
    def create_vehiculo(placa="ABC123", propietario="Test Owner", tipo_vehiculo=None, usuario=None):
        """Crear vehículo de prueba"""
        if tipo_vehiculo is None:
            tipo_vehiculo = CoreTestFixtures.create_tipo_vehiculo(usuario=usuario)
        
        return Vehiculo.objects.create(
            placa=placa,
            propietario=propietario,
            cubicaje=50.00,
            marca="Toyota",
            modelo="Hilux",
            año=2023,
            tipo_vehiculo=tipo_vehiculo,
            estado=True,
            eliminado=False,
            usuario_creacion=usuario
        )
    
    @staticmethod
    def create_conductor(cedula="1234567890", nombre="Juan Pérez", usuario=None):
        """Crear conductor de prueba"""
        return Conductor.objects.create(
            cedula=cedula,
            nombre=nombre,
            celular="3001234567",
            licencia=["C1", "C2"],
            estado=True,
            eliminado=False,
            usuario_creacion=usuario
        )
    
    @staticmethod
    def create_master_estado(descripcion="Activo", usuario=None):
        """Crear estado maestro de prueba"""
        return MasterEstado.objects.create(
            descripcion=descripcion,
            usuario_creacion=usuario,
            estado=True
        )
    
    @staticmethod
    def create_cliente(nombre="Cliente Test", estado_maestro=None, usuario=None):
        """Crear cliente de prueba"""
        if estado_maestro is None:
            estado_maestro = CoreTestFixtures.create_master_estado(usuario=usuario)
        
        # Crear imagen de prueba
        logo = SimpleUploadedFile(
            name='test_logo.jpg',
            content=b'fake image content',
            content_type='image/jpeg'
        )
        
        return Cliente.objects.create(
            nombre=nombre,
            logo=logo,
            estado=estado_maestro,
            eliminado=False,
            usuario_creacion=usuario
        )
    
    @staticmethod
    def create_categoria(descripcion="Categoría Test", usuario=None):
        """Crear categoría de prueba"""
        return Categoria.objects.create(
            descripcion=descripcion,
            estado=True,
            eliminado=False,
            usuario_creacion=usuario
        )
    
    @staticmethod
    def create_unidad_medida(descripcion="Kilogramo", abreviatura="kg", usuario=None):
        """Crear unidad de medida de prueba"""
        return UnidadMedida.objects.create(
            descripcion=descripcion,
            abreviatura=abreviatura,
            estado=True,
            eliminado=False,
            usuario_creacion=usuario
        )
    
    @staticmethod
    def create_articulo(codigo="ART001", descripcion="Artículo Test", categoria=None, unidad_medida=None, usuario=None):
        """Crear artículo de prueba"""
        if categoria is None:
            categoria = CoreTestFixtures.create_categoria(usuario=usuario)
        if unidad_medida is None:
            unidad_medida = CoreTestFixtures.create_unidad_medida(usuario=usuario)
        
        return Articulo.objects.create(
            codigo=codigo,
            descripcion=descripcion,
            unidad_medida_general=unidad_medida,
            categoria=categoria,
            estado=True,
            eliminado=False,
            usuario_creacion=usuario
        )
    
    @staticmethod
    def create_full_inventory_structure(usuario=None):
        """Crear estructura completa de inventario para tests"""
        tipo_vehiculo = CoreTestFixtures.create_tipo_vehiculo("Camión", usuario)
        vehiculo = CoreTestFixtures.create_vehiculo("XYZ789", "Owner Test", tipo_vehiculo, usuario)
        conductor = CoreTestFixtures.create_conductor("9876543210", "Pedro López", usuario)
        estado = CoreTestFixtures.create_master_estado("Activo", usuario)
        cliente = CoreTestFixtures.create_cliente("Cliente ABC", estado, usuario)
        categoria = CoreTestFixtures.create_categoria("Herramientas", usuario)
        unidad = CoreTestFixtures.create_unidad_medida("Unidad", "und", usuario)
        articulo = CoreTestFixtures.create_articulo("TOOL001", "Martillo", categoria, unidad, usuario)
        
        return {
            'tipo_vehiculo': tipo_vehiculo,
            'vehiculo': vehiculo,
            'conductor': conductor,
            'estado': estado,
            'cliente': cliente,
            'categoria': categoria,
            'unidad_medida': unidad,
            'articulo': articulo
        }
