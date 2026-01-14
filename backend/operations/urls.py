from django.urls import path
from .views import (
    UploadPlanNormalView,
    UploadPlanRView,
    UnifiedConsultasView,
    UploadHistoryView,
    DeliveryPlanStatsView,
    DeliveryPlanDetailsView,
    DeliveryPlanExportDetailsView
)

app_name = 'operations'

urlpatterns = [
    # Carga de archivos
    path('upload-plan-normal/', UploadPlanNormalView.as_view(), name='upload_plan_normal'),
    path('upload-plan-r/', UploadPlanRView.as_view(), name='upload_plan_r'),
    
    # Consultas
    path('delivery-plans/', UnifiedConsultasView.as_view(), name='delivery_plans'),
    path('upload-history/', UploadHistoryView.as_view(), name='upload_history'),
    path('stats/', DeliveryPlanStatsView.as_view(), name='stats'),
    path('delivery-plans/<str:pk>/details/', DeliveryPlanDetailsView.as_view(), name='plan_details'),
    path('delivery-plans/export-details/', DeliveryPlanExportDetailsView.as_view(), name='export_details'),
]
