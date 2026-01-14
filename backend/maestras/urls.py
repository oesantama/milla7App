# ruta: backend/maestras/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ModuloViewSet,
    PaginaViewSet,
    TabViewSet,
    RolViewSet,
    PermisoPorRolViewSet,
    PermisoPorUsuarioViewSet,
    TipoNotificacionViewSet,
    MasterEstadoViewSet
)

router = DefaultRouter()
router.register(r'modulos', ModuloViewSet, basename='modulo')
router.register(r'paginas', PaginaViewSet, basename='pagina')
router.register(r'tabs', TabViewSet, basename='tab')
router.register(r'roles', RolViewSet) # Modified: basename removed
router.register(r'permisos', PermisoPorRolViewSet) # Modified: path changed from 'permisos-rol' to 'permisos', basename removed
router.register(r'permisos-usuario', PermisoPorUsuarioViewSet) # Modified: basename removed
router.register(r'tipos-notificacion', TipoNotificacionViewSet) # Added: new registration
router.register(r'master-estados', MasterEstadoViewSet) # Added: new registration

urlpatterns = [
    path('', include(router.urls)),
]