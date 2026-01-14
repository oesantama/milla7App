# ruta: backend/core/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Vehiculo, Conductor, Cliente, TipoVehiculo, Categoria, Articulo, UnidadMedida

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class VehiculoSerializer(serializers.ModelSerializer):
    tipo_vehiculo_descripcion = serializers.ReadOnlyField(source='tipo_vehiculo.descripcion')
    estado_descripcion = serializers.ReadOnlyField(source='estado.descripcion')
    
    class Meta:
        model = Vehiculo
        fields = '__all__'

class ConductorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conductor
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'logo', 'estado', 'fecha_creacion', 'fecha_modificacion', 'usuario_creacion', 'usuario_modificacion']
        read_only_fields = ['fecha_creacion', 'fecha_modificacion', 'usuario_creacion', 'usuario_modificacion']
    
    def to_representation(self, instance):
        """Personalizar la representación para devolver URL completa del logo"""
        data = super().to_representation(instance)
        if instance.logo:
            # Devolver URL completa accesible desde el navegador
            data['logo'] = f"http://localhost:3036{instance.logo.url}"
        return data

class TipoVehiculoSerializer(serializers.ModelSerializer):
    usuario_creacion_nombre = serializers.ReadOnlyField(source='usuario_creacion.username')
    usuario_modificacion_nombre = serializers.ReadOnlyField(source='usuario_modificacion.username')

    class Meta:
        model = TipoVehiculo
        fields = '__all__'

class UnidadMedidaSerializer(serializers.ModelSerializer):
    usuario_creacion_nombre = serializers.ReadOnlyField(source='usuario_creacion.username')
    usuario_modificacion_nombre = serializers.ReadOnlyField(source='usuario_modificacion.username')

    class Meta:
        model = UnidadMedida
        fields = '__all__'
        read_only_fields = ['fecha_creacion', 'fecha_modificacion', 'usuario_creacion', 'usuario_modificacion']

class CategoriaSerializer(serializers.ModelSerializer):
    usuario_creacion_nombre = serializers.ReadOnlyField(source='usuario_creacion.username')
    usuario_modificacion_nombre = serializers.ReadOnlyField(source='usuario_modificacion.username')

    class Meta:
        model = Categoria
        fields = '__all__'

class ArticuloSerializer(serializers.ModelSerializer):
    categoria_descripcion = serializers.ReadOnlyField(source='categoria.descripcion')
    unidad_medida_general_descripcion = serializers.ReadOnlyField(source='unidad_medida_general.descripcion')
    unidad_medida_especial_descripcion = serializers.ReadOnlyField(source='unidad_medida_especial.descripcion')
    unidad_medida_intermedia_descripcion = serializers.ReadOnlyField(source='unidad_medida_intermedia.descripcion')
    usuario_creacion_nombre = serializers.ReadOnlyField(source='usuario_creacion.username')
    usuario_modificacion_nombre = serializers.ReadOnlyField(source='usuario_modificacion.username')

    class Meta:
        model = Articulo
        fields = '__all__'
        read_only_fields = ['fecha_creacion', 'fecha_modificacion', 'usuario_creacion', 'usuario_modificacion']
