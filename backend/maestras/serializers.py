# ruta: backend/maestras/serializers.py
from rest_framework import serializers
from .models import Modulo, Pagina, Tab, Rol, PermisoPorRol, PermisoPorUsuario, MasterEstado, TipoNotificacion

class TabSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tab
        fields = ['id_tab', 'descripcion_tabs', 'estado', 'icono', 'route', 'pagina']

class PaginaSerializer(serializers.ModelSerializer):
    tabs = TabSerializer(many=True, read_only=True)
    class Meta:
        model = Pagina
        fields = ['id', 'descripcion_pages', 'estado', 'icono', 'route', 'tabs', 'modulo']

class ModuloSerializer(serializers.ModelSerializer):
    paginas = PaginaSerializer(many=True, read_only=True)
    class Meta:
        model = Modulo
        fields = ['id', 'descripcion_modulo', 'estado', 'es_expansivo', 'route', 'paginas', 'order']

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id_rol', 'descripcion_rol', 'estado', 'fecha_creacion']

class NestedPaginaSerializer(serializers.ModelSerializer):
    modulo = serializers.StringRelatedField()
    class Meta:
        model = Pagina
        fields = ('descripcion_pages', 'modulo')

class NestedTabSerializer(serializers.ModelSerializer):
    pagina = NestedPaginaSerializer(read_only=True)
    class Meta:
        model = Tab
        fields = ('id_tab', 'descripcion_tabs', 'pagina')

class PermisoPorRolSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermisoPorRol
        fields = '__all__'

class PermisoPorUsuarioSerializer(serializers.ModelSerializer):
    usuario = serializers.StringRelatedField(read_only=True)
    tab = NestedTabSerializer(read_only=True)
    class Meta:
        model = PermisoPorUsuario
        fields = ('usuario', 'tab', 'ver', 'crear', 'editar', 'borrar')

class TipoNotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoNotificacion
        fields = '__all__'

class MasterEstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterEstado
        fields = '__all__'
