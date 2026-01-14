# ruta: backend/core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VehiculoViewSet, ConductorViewSet, ClienteViewSet, TipoVehiculoViewSet, 
    CategoriaViewSet, ArticuloViewSet, UnidadMedidaViewSet, ImportMasterView
)

router = DefaultRouter()
router.register(r'vehiculos', VehiculoViewSet, basename='vehiculo')
router.register(r'conductores', ConductorViewSet, basename='conductor')
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'tipos-vehiculos', TipoVehiculoViewSet, basename='tipo_vehiculo')
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'articulos', ArticuloViewSet, basename='articulo')
router.register(r'unidades-medida', UnidadMedidaViewSet, basename='unidad_medida')
router.register(r'import-master', ImportMasterView, basename='import_master')

urlpatterns = [
    path('', include(router.urls)),
]
