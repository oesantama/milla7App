from django.urls import path
from .views import (
    HealthCheck, UserView, SolicitudImportView, SolicitudImportPlanRView, ValidateCargasView,
    CargasPendientesView, BuscarArticuloView, ProcesarItemView, ValidarRecepcionView,
    CorreosNotificacionViewSet, RecepcionProgressView # Added details
)
from .views_routes import PendingItemsView, AutoRouteView, SaveRouteView

app_name = 'logistics'
urlpatterns = [
    path('health/', HealthCheck.as_view(), name='health'),
    path('user/', UserView.as_view(), name='user_detail'),
    path('solicitudes/importar/', SolicitudImportView.as_view(), name='import_solicitudes'),
    path('solicitudes/importar-plan-r/', SolicitudImportPlanRView.as_view(), name='import_solicitudes_plan_r'),
    path('solicitudes/validar-existencia/', ValidateCargasView.as_view(), name='validate_cargas'),
    
    # Recibido Material Endpoints
    path('recepcion/cargas-pendientes/', CargasPendientesView.as_view(), name='recepcion_cargas_pendientes'),
    path('recepcion/buscar-articulo/', BuscarArticuloView.as_view(), name='recepcion_buscar_articulo'),
    path('recepcion/procesar-item/', ProcesarItemView.as_view(), name='recepcion_procesar_item'),
    path('recepcion/validar-carga/', ValidarRecepcionView.as_view(), name='recepcion_validar_carga'),
    path('recepcion/progreso/<int:carga_id>/', RecepcionProgressView.as_view(), name='recepcion_progress'),

    # CRUD Correos Notificacion
    path('correos-notificacion/', CorreosNotificacionViewSet.as_view({'get': 'list', 'post': 'create'}), name='correos-list'),
    path('correos-notificacion/<int:pk>/', CorreosNotificacionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='correos-detail'),

    # Ruta de Carga (Routes Dispatch)
    path('routes/pending-items/', PendingItemsView.as_view(), name='routes_pending'),
    path('routes/auto-route/', AutoRouteView.as_view(), name='routes_auto'),
    path('routes/', SaveRouteView.as_view(), name='routes_save'),
]
