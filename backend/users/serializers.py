# ruta: backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para crear y actualizar usuarios"""
    password = serializers.CharField(write_only=True, required=False)
    role_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    permisos = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    clientes = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'password', 'role_id', 'phone_number', 'permisos', 'clientes']
    
    def create(self, validated_data):
        from maestras.models import Rol, PermisoPorUsuario
        
        role_id = validated_data.pop('role_id', None)
        phone_number = validated_data.pop('phone_number', '')
        permisos_data = validated_data.pop('permisos', [])
        clientes_ids = validated_data.pop('clientes', [])
        password = validated_data.pop('password')
        
        # Crear usuario
        user = User.objects.create_user(**validated_data, password=password)
        
        # Crear perfil
        role = Rol.objects.get(id_rol=role_id) if role_id else None
        profile = UserProfile.objects.create(user=user, role=role, phone_number=phone_number)
        
        # Asignar clientes
        if clientes_ids:
            profile.clientes.set(clientes_ids)
        
        # Asignar permisos con flags CRUD
        for permiso in permisos_data:
            PermisoPorUsuario.objects.create(
                usuario=user,
                tab_id=permiso['tab_id'],
                ver=permiso.get('ver', False),
                crear=permiso.get('crear', False),
                editar=permiso.get('editar', False),
                borrar=permiso.get('borrar', False),
                usuario_creacion=self.context['request'].user
            )
        
        return user
    
    def update(self, instance, validated_data):
        from maestras.models import Rol, PermisoPorUsuario
        
        role_id = validated_data.pop('role_id', None)
        phone_number = validated_data.pop('phone_number', None)
        permisos_data = validated_data.pop('permisos', None)
        clientes_ids = validated_data.pop('clientes', None)
        password = validated_data.pop('password', None)
        
        # Actualizar usuario
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        
        # Actualizar perfil
        if not hasattr(instance, 'profile'):
            UserProfile.objects.create(user=instance)
            # Re-fetch para asegurar que la relación está disponible en caché si es necesario, 
            # aunque instance.profile debería funcionar tras create si se accede de nuevo o se refresca.
            instance.refresh_from_db()

        if hasattr(instance, 'profile'):
            if role_id is not None:
                instance.profile.role = Rol.objects.get(id_rol=role_id) if role_id else None
            if phone_number is not None:
                instance.profile.phone_number = phone_number
            if clientes_ids is not None:
                instance.profile.clientes.set(clientes_ids)
            instance.profile.save()
        
        # Actualizar permisos con flags CRUD
        if permisos_data is not None:
            PermisoPorUsuario.objects.filter(usuario=instance).delete()
            for permiso in permisos_data:
                PermisoPorUsuario.objects.create(
                    usuario=instance,
                    tab_id=permiso['tab_id'],
                    ver=permiso.get('ver', False),
                    crear=permiso.get('crear', False),
                    editar=permiso.get('editar', False),
                    borrar=permiso.get('borrar', False),
                    usuario_creacion=self.context['request'].user
                )
        
        return instance


class UserListSerializer(serializers.ModelSerializer):
    """Serializer para listar usuarios"""
    role_name = serializers.SerializerMethodField()
    role_id = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    permisos = serializers.SerializerMethodField()
    clientes = serializers.SerializerMethodField()
    eliminado = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'is_superuser', 'role_name', 'role_id', 'phone_number', 'permisos', 'clientes', 'date_joined', 'last_login', 'eliminado']
    
    def get_role_name(self, obj):
        if hasattr(obj, 'profile') and obj.profile and obj.profile.role:
            return obj.profile.role.descripcion_rol
        return None

    def get_role_id(self, obj):
        if hasattr(obj, 'profile') and obj.profile and obj.profile.role:
            return obj.profile.role.id_rol
        return None
    
    def get_phone_number(self, obj):
        if hasattr(obj, 'profile') and obj.profile:
            return obj.profile.phone_number
        return None

    def get_eliminado(self, obj):
        if hasattr(obj, 'profile') and obj.profile:
            return obj.profile.eliminado
        return False
    
    def get_permisos(self, obj):
        from maestras.models import PermisoPorUsuario, PermisoPorRol, Tab
        
        # 0. Si es superusuario, devolver permisos completos para TODOS los tabs activos
        if obj.is_superuser:
            all_tabs = Tab.objects.filter(estado=True).select_related('pagina')
            return [
                {
                    'id': t.id_tab,
                    'nombre': f"{t.pagina.descripcion_pages} - {t.descripcion_tabs}" if t.pagina else t.descripcion_tabs,
                    'ver': True,
                    'crear': True,
                    'editar': True,
                    'borrar': True
                } for t in all_tabs
            ]


        # 1. Obtener permisos del Rol
        permisos_rol = {}
        if hasattr(obj, 'profile') and obj.profile and obj.profile.role:
            qs_rol = PermisoPorRol.objects.filter(rol=obj.profile.role).select_related('tab', 'tab__pagina')
            for p in qs_rol:
                if p.tab:
                    nombre_permiso = f"{p.tab.pagina.descripcion_pages} - {p.tab.descripcion_tabs}" if p.tab.pagina else p.tab.descripcion_tabs
                    permisos_rol[p.tab.id_tab] = {
                        'id': p.tab.id_tab,
                        'nombre': nombre_permiso,
                        'ver': p.ver,
                        'crear': p.crear,
                        'editar': p.editar,
                        'borrar': p.borrar
                    }
        
        # 2. Obtener permisos directos del Usuario (Overrides)
        qs_usuario = PermisoPorUsuario.objects.filter(usuario=obj).select_related('tab', 'tab__pagina')
        for p in qs_usuario:
            if p.tab:
                nombre_permiso = f"{p.tab.pagina.descripcion_pages} - {p.tab.descripcion_tabs}" if p.tab.pagina else p.tab.descripcion_tabs
                permisos_rol[p.tab.id_tab] = {
                    'id': p.tab.id_tab,
                    'nombre': nombre_permiso,
                    'ver': p.ver,
                    'crear': p.crear,
                    'editar': p.editar,
                    'borrar': p.borrar
                }
        
        return list(permisos_rol.values())
    
    def get_clientes(self, obj):
        if hasattr(obj, 'profile') and obj.profile:
            return [{
                'id': c.id, 
                'nombre': c.nombre,
                'logo': c.logo.url if c.logo else None
            } for c in obj.profile.clientes.all()]
        return []