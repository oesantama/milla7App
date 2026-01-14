# ruta: backend/users/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import UserListSerializer, UserCreateUpdateSerializer

class CurrentUserProfileView(APIView):
    """Endpoint para obtener el perfil del usuario actual"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = User.objects.select_related('profile', 'profile__role').get(id=request.user.id)
        serializer = UserListSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()
        serializer = UserListSerializer(user)
        return Response(serializer.data)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({'error': 'La contraseña actual es incorrecta'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        # Maintain session (optional depending on auth method, but good practice for token based is moot, though for session based it invalidates)
        # For JWT/Token it usually doesn't invalidate immediately unless we track tokens.
        return Response({'message': 'Contraseña actualizada correctamente'})

class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all().select_related('profile', 'profile__role')
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateUpdateSerializer
        return UserListSerializer
    
    def get_queryset(self):
        """Filtrar usuarios eliminados para no superusuarios/admin"""
        queryset = super().get_queryset()
        
        can_see_deleted = False
        if self.request.user.is_superuser:
            can_see_deleted = True
        elif hasattr(self.request.user, 'profile') and self.request.user.profile.role:
            if self.request.user.profile.role.id_rol == 1:
                can_see_deleted = True
        
        if not can_see_deleted:
            # Ahora filtramos por el campo eliminado del perfil, permitiendo ver inactivos
            queryset = queryset.filter(profile__eliminado=False)
            
        return queryset.order_by('-date_joined')
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete: marcar como eliminado en perfil e inactivo en usuario"""
        instance = self.get_object()
        
        # Marcar como inactivo para prevenir login
        instance.is_active = False
        instance.save()
        
        # Marcar como eliminado en perfil para distinción visual
        if hasattr(instance, 'profile'):
            instance.profile.eliminado = True
            instance.profile.save()
            
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def permisos_disponibles(self, request):
        """Endpoint para obtener todos los tabs disponibles con jerarquía"""
        from maestras.models import Tab
        from maestras.serializers import NestedTabSerializer
        tabs = Tab.objects.filter(estado=True).select_related('pagina__modulo').order_by('pagina__modulo__order', 'pagina__order', 'descripcion_tabs')
        serializer = NestedTabSerializer(tabs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def roles_disponibles(self, request):
        """Endpoint para obtener todos los roles disponibles"""
        from maestras.models import Rol
        from maestras.serializers import RolSerializer
        roles = Rol.objects.all().order_by('descripcion_rol')
        serializer = RolSerializer(roles, many=True)
        return Response(serializer.data)
