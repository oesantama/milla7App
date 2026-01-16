# ruta: backend/maestras/tests/fixtures.py
"""
Fixtures y datos de prueba reutilizables para tests del módulo maestras.
"""
from django.contrib.auth import get_user_model
from maestras.models import (
    Modulo, Pagina, Tab, Rol, PermisoPorRol, PermisoPorUsuario,
    MasterEstado, TipoNotificacion
)

User = get_user_model()


class MaestrasTestFixtures:
    """Clase helper para crear datos de prueba del módulo maestras"""
    
    @staticmethod
    def create_test_user(username="testuser", password="testpass123"):
        """Crear usuario de prueba"""
        return User.objects.create_user(
            username=username,
            password=password,
            email=f"{username}@test.com"
        )
    
    @staticmethod
    def create_modulo(descripcion="Módulo Test", order=1, usuario=None):
        """Crear módulo de prueba"""
        return Modulo.objects.create(
            descripcion_modulo=descripcion,
            order=order,
            es_expansivo=True,
            route=f"/{descripcion.lower().replace(' ', '-')}",
            usuario_creacion=usuario,
            estado=True
        )
    
    @staticmethod
    def create_pagina(modulo, descripcion="Página Test", order=1, usuario=None):
        """Crear página de prueba"""
        return Pagina.objects.create(
            modulo=modulo,
            descripcion_pages=descripcion,
            order=order,
            icono="icon-test",
            route=f"/{descripcion.lower().replace(' ', '-')}",
            usuario_creacion=usuario,
            estado=True
        )
    
    @staticmethod
    def create_tab(pagina, descripcion="Tab Test", usuario=None):
        """Crear tab de prueba"""
        return Tab.objects.create(
            pagina=pagina,
            descripcion_tabs=descripcion,
            icono="icon-tab",
            route=f"/{descripcion.lower().replace(' ', '-')}",
            usuario_creacion=usuario,
            estado=True
        )
    
    @staticmethod
    def create_rol(descripcion="Rol Test", usuario=None, master_estado=None):
        """Crear rol de prueba"""
        if master_estado is None:
            # Si no se provee estado maestro, crear uno por defecto o buscar uno
            master_estado, _ = MasterEstado.objects.get_or_create(
                descripcion="Activo",
                defaults={'usuario_creacion': usuario, 'estado': True}
            )
            
        return Rol.objects.create(
            descripcion_rol=descripcion,
            usuario_creacion=usuario,
            estado=master_estado
        )
    
    @staticmethod
    def create_permiso_por_rol(rol, tab, ver=True, crear=False, editar=False, borrar=False, usuario=None):
        """Crear permiso por rol de prueba"""
        return PermisoPorRol.objects.create(
            rol=rol,
            tab=tab,
            ver=ver,
            crear=crear,
            editar=editar,
            borrar=borrar,
            usuario_creacion=usuario,
            estado=True
        )
    
    @staticmethod
    def create_permiso_por_usuario(usuario_permiso, tab, cliente=None, ver=True, crear=False, editar=False, borrar=False, usuario_creador=None):
        """Crear permiso por usuario de prueba"""
        return PermisoPorUsuario.objects.create(
            usuario=usuario_permiso,
            tab=tab,
            cliente=cliente,
            ver=ver,
            crear=crear,
            editar=editar,
            borrar=borrar,
            usuario_creacion=usuario_creador,
            estado=True
        )
    
    @staticmethod
    def create_master_estado(descripcion="Estado Test", usuario=None):
        """Crear estado maestro de prueba"""
        return MasterEstado.objects.create(
            descripcion=descripcion,
            usuario_creacion=usuario,
            estado=True
        )
    
    @staticmethod
    def create_tipo_notificacion(nombre="Tipo Test", descripcion="Descripción test", usuario=None):
        """Crear tipo de notificación de prueba"""
        return TipoNotificacion.objects.create(
            nombre=nombre,
            descripcion=descripcion,
            usuario_creacion=usuario,
            estado=True
        )
    
    @staticmethod
    def create_full_menu_structure(usuario=None):
        """Crear estructura completa de menú para tests"""
        modulo = MaestrasTestFixtures.create_modulo("Gestión", 1, usuario)
        pagina = MaestrasTestFixtures.create_pagina(modulo, "Usuarios", 1, usuario)
        tab = MaestrasTestFixtures.create_tab(pagina, "Listado", usuario)
        rol = MaestrasTestFixtures.create_rol("Admin", usuario)
        permiso = MaestrasTestFixtures.create_permiso_por_rol(
            rol, tab, ver=True, crear=True, editar=True, borrar=True, usuario=usuario
        )
        
        return {
            'modulo': modulo,
            'pagina': pagina,
            'tab': tab,
            'rol': rol,
            'permiso': permiso
        }
