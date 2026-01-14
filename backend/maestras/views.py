from django.db.models import Prefetch
from django.http import HttpResponse
import csv
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Modulo, Pagina, Tab, Rol, PermisoPorRol, PermisoPorUsuario, MasterEstado
from .serializers import (
    ModuloSerializer,
    PaginaSerializer,
    TabSerializer,
    RolSerializer,
    PermisoPorRolSerializer,
    PermisoPorUsuarioSerializer,
    MasterEstadoSerializer
)

class MasterEstadoViewSet(viewsets.ModelViewSet):
    queryset = MasterEstado.objects.all().order_by('id')
    serializer_class = MasterEstadoSerializer

class ModuloViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and managing menu structure.
    Standard list is filtered by permissions.
    admin_tree action returns full structure.
    """
    serializer_class = ModuloSerializer

    def get_queryset(self):
        # For non-list actions (retrieve, update, delete, admin_tree), return all objects
        if self.action != 'list':
            return Modulo.objects.all().order_by('order')
            
        # For 'list' action, apply the Permission Logic (Menu Generation)
        from users.models import UserProfile
        user = self.request.user
        
        # Superuser sees everything active in the menu
        if user.is_superuser:
            return Modulo.objects.filter(estado=True).prefetch_related(
                Prefetch('paginas', queryset=Pagina.objects.filter(estado=True).prefetch_related(
                    Prefetch('tabs', queryset=Tab.objects.filter(estado=True).order_by('descripcion_tabs'))
                ).order_by('order'))
            ).order_by('order')

        # For regular users, determine visible tabs based on roles and direct permissions.
        try:
            user_profile = UserProfile.objects.get(user=user)
            if user_profile.role:
                role_tabs = Tab.objects.filter(
                    permisos_rol__rol=user_profile.role,
                    permisos_rol__ver=True,
                    permisos_rol__estado=True, 
                    estado=True,
                    pagina__estado=True,
                    pagina__modulo__estado=True
                )
            else:
                role_tabs = Tab.objects.none()
        except UserProfile.DoesNotExist:
            role_tabs = Tab.objects.none()

        user_tabs = Tab.objects.filter(
            permisos_usuario__usuario=user,
            permisos_usuario__ver=True,
            permisos_usuario__estado=True, 
            estado=True,
            pagina__estado=True,
            pagina__modulo__estado=True
        )

        visible_tab_ids = (role_tabs | user_tabs).distinct().values_list('id_tab', flat=True)
        
        if not visible_tab_ids.exists(): 
            return Modulo.objects.none()

        visible_page_ids = Tab.objects.filter(id_tab__in=visible_tab_ids).values_list('pagina_id', flat=True).distinct()
        visible_module_ids = Pagina.objects.filter(id__in=visible_page_ids).values_list('modulo_id', flat=True).distinct()

        queryset = Modulo.objects.filter(id__in=visible_module_ids, estado=True).prefetch_related(
            Prefetch(
                'paginas',
                queryset=Pagina.objects.filter(id__in=visible_page_ids, estado=True).prefetch_related(
                    Prefetch(
                        'tabs',
                        queryset=Tab.objects.filter(id_tab__in=visible_tab_ids, estado=True).order_by('descripcion_tabs')
                    )
                ).order_by('order')
            )
        ).order_by('order')

        return queryset

    @action(detail=False, methods=['get'])
    def admin_tree(self, request):
        """
        Returns the full tree structure (Modules -> Pages -> Tabs) for administration.
        Includes inactive items.
        """
        queryset = Modulo.objects.all().prefetch_related(
            Prefetch('paginas', queryset=Pagina.objects.all().prefetch_related(
                Prefetch('tabs', queryset=Tab.objects.all().order_by('descripcion_tabs'))
            ).order_by('order'))
        ).order_by('order')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PaginaViewSet(viewsets.ModelViewSet):
    queryset = Pagina.objects.filter(estado=True)
    serializer_class = PaginaSerializer

class TabViewSet(viewsets.ModelViewSet):
    queryset = Tab.objects.filter(estado=True)
    serializer_class = TabSerializer

class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer

    def get_queryset(self):
        queryset = Rol.objects.all()
        user = self.request.user
        if not user.is_superuser:
            queryset = queryset.exclude(descripcion_rol__iexact='Superusuario')
        return queryset

    @action(detail=True, methods=['get', 'post'])
    def permisos(self, request, pk=None):
        role = self.get_object()
        if request.method == 'GET':
            tabs = Tab.objects.filter(estado=True).select_related('pagina', 'pagina__modulo').order_by('pagina__modulo__order', 'pagina__order', 'descripcion_tabs')
            perms = { p.tab_id: p for p in PermisoPorRol.objects.filter(rol=role) }
            
            data = []
            for tab in tabs:
                p = perms.get(tab.id_tab)
                data.append({
                    'tab_id': tab.id_tab,
                    'modulo': tab.pagina.modulo.descripcion_modulo,
                    'pagina': tab.pagina.descripcion_pages,
                    'tab': tab.descripcion_tabs,
                    'ver': p.ver if p else False,
                    'crear': p.crear if p else False,
                    'editar': p.editar if p else False,
                    'borrar': p.borrar if p else False,
                    'estado': p.estado if p else False # Default false if no record
                })
            return Response(data)

        if request.method == 'POST':
            permisos_data = request.data.get('permisos', [])
            for p_data in permisos_data:
                 PermisoPorRol.objects.update_or_create(
                     rol=role,
                     tab_id=p_data['tab_id'],
                     defaults={
                         'ver': p_data.get('ver', False),
                         'crear': p_data.get('crear', False),
                         'editar': p_data.get('editar', False),
                         'borrar': p_data.get('borrar', False),
                         'estado': p_data.get('estado', True)
                     }
                 )
            return Response({'status': 'ok'})

    @action(detail=False, methods=['get'])
    def exportar_excel(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="roles_permisos.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID Rol', 'Rol', 'Estado Rol', 'Módulo', 'Página', 'Tab', 'Activo', 'Ver', 'Crear', 'Editar', 'Borrar'])
        
        roles = Rol.objects.all().prefetch_related('permisos')
        tabs = Tab.objects.filter(estado=True).select_related('pagina', 'pagina__modulo').order_by('pagina__modulo__order', 'pagina__order', 'descripcion_tabs')
        
        for role in roles:
            perms_map = {p.tab_id: p for p in role.permisos.all()}
            for tab in tabs:
                p = perms_map.get(tab.id_tab)
                writer.writerow([
                    role.id_rol,
                    role.descripcion_rol,
                    'Activo' if role.estado else 'Inactivo',
                    tab.pagina.modulo.descripcion_modulo,
                    tab.pagina.descripcion_pages,
                    tab.descripcion_tabs,
                    'SI' if (p and p.estado) else 'NO',
                    'SI' if (p and p.ver) else 'NO',
                    'SI' if (p and p.crear) else 'NO',
                    'SI' if (p and p.editar) else 'NO',
                    'SI' if (p and p.borrar) else 'NO',
                ])
        
        return response

class PermisoPorRolViewSet(viewsets.ModelViewSet):
    queryset = PermisoPorRol.objects.all()
    serializer_class = PermisoPorRolSerializer

class PermisoPorUsuarioViewSet(viewsets.ModelViewSet):
    queryset = PermisoPorUsuario.objects.all()
    serializer_class = PermisoPorUsuarioSerializer


from .models import TipoNotificacion
from .serializers import TipoNotificacionSerializer
from rest_framework.permissions import IsAuthenticated

class TipoNotificacionViewSet(viewsets.ModelViewSet):
    queryset = TipoNotificacion.objects.all().order_by('id')
    serializer_class = TipoNotificacionSerializer
    permission_classes = [IsAuthenticated]