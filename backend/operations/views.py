import time
import pandas as pd
from decimal import Decimal, InvalidOperation
from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.generics import ListAPIView

from .models import DeliveryPlan, FileUploadLog
from .serializers import (
    DeliveryPlanSerializer,
    FileUploadLogSerializer,
    FileUploadResponseSerializer
)


class UploadPlanNormalView(APIView):
    """
    Vista para cargar archivos Plan Normal (XLS/XLSX).
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        start_time = time.time()
        
        if 'file' not in request.FILES:
            return Response({
                'success': False,
                'message': 'No se ha enviado ningún archivo'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = request.FILES['file']
        filename = uploaded_file.name
        
        # Validar extensión
        if not (filename.endswith('.xls') or filename.endswith('.xlsx')):
            return Response({
                'success': False,
                'message': 'El archivo debe ser de tipo XLS o XLSX'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        file_type = 'XLSX' if filename.endswith('.xlsx') else 'XLS'
        errors = []
        success_count = 0
        failed_count = 0
        
        try:
            # Leer archivo Excel con pandas
            df = pd.read_excel(uploaded_file)
            total_rows = len(df)
            
            # Crear log de carga
            upload_log = FileUploadLog.objects.create(
                filename=filename,
                file_type=file_type,
                plan_type='PLAN_NORMAL',
                total_rows=total_rows,
                uploaded_by=request.user,
                status='SUCCESS'
            )
            
            # Procesar cada fila
            with transaction.atomic():
                for idx, row in df.iterrows():
                    try:
                        # Aquí adaptaremos según la estructura real del archivo
                        # Por ahora, creamos un registro genérico
                        delivery_plan = DeliveryPlan(
                            plan_type='PLAN_NORMAL',
                            file_source=filename,
                            uploaded_by=request.user
                        )
                        
                        # Mapear columnas del archivo a campos del modelo
                        # Esto se ajustará cuando veamos la estructura real
                        # Por ahora, guardamos en campos extra
                        for col_idx, (col_name, value) in enumerate(row.items()):
                            if pd.notna(value):
                                if col_idx == 0:
                                    delivery_plan.extra_field_1 = str(value)[:200]
                                elif col_idx == 1:
                                    delivery_plan.extra_field_2 = str(value)[:200]
                                elif col_idx == 2:
                                    delivery_plan.extra_field_3 = str(value)[:200]
                                elif col_idx == 3:
                                    delivery_plan.extra_field_4 = str(value)
                                elif col_idx == 4:
                                    delivery_plan.extra_field_5 = str(value)
                        
                        delivery_plan.save()
                        success_count += 1
                        
                    except Exception as e:
                        failed_count += 1
                        errors.append({
                            'row': idx + 2,  # +2 porque idx empieza en 0 y hay header
                            'error': str(e)
                        })
                
                # Actualizar log
                upload_log.records_processed = total_rows
                upload_log.records_success = success_count
                upload_log.records_failed = failed_count
                upload_log.error_log = errors if errors else None
                upload_log.processing_time = time.time() - start_time
                upload_log.status = 'PARTIAL' if failed_count > 0 else 'SUCCESS'
                upload_log.save()
            
            return Response({
                'success': True,
                'message': f'Archivo procesado correctamente',
                'upload_log_id': upload_log.id,
                'stats': {
                    'total_rows': total_rows,
                    'success': success_count,
                    'failed': failed_count,
                    'processing_time': round(time.time() - start_time, 2)
                },
                'errors': errors[:10] if errors else []  # Solo primeros 10 errores
            })
            
        except Exception as e:
            # Error general al procesar el archivo
            upload_log = FileUploadLog.objects.create(
                filename=filename,
                file_type=file_type,
                plan_type='PLAN_NORMAL',
                total_rows=0,
                records_processed=0,
                records_success=0,
                records_failed=0,
                error_log=[{'error': str(e)}],
                processing_time=time.time() - start_time,
                uploaded_by=request.user,
                status='FAILED'
            )
            
            return Response({
                'success': False,
                'message': f'Error al procesar el archivo: {str(e)}',
                'upload_log_id': upload_log.id
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UploadPlanRView(APIView):
    """
    Vista para cargar archivos Plan R (CSV) o Datos JSON desde Frontend.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def post(self, request):
        start_time = time.time()
        
        # --- Handle JSON Input (from Frontend Preview) ---
        if isinstance(request.data, list):
            data_list = request.data
            total_rows = len(data_list)
             # Crear log de carga
            upload_log = FileUploadLog.objects.create(
                filename=f"Import_JSON_{int(time.time())}.csv",
                file_type='JSON',
                plan_type='PLAN_R',
                total_rows=total_rows,
                uploaded_by=request.user,
                status='SUCCESS'
            )
            
            success_count = 0
            failed_count = 0
            errors = []

            # Función auxiliar para convertir a Decimal
            def to_decimal(value, default=None):
                if value is None or value == '':
                    return default
                try:
                    # Clean currency/string formatting if needed
                    val_str = str(value).replace(',', '.').replace('$','').strip()
                    return Decimal(val_str)
                except (InvalidOperation, ValueError):
                    return default

            with transaction.atomic():
                for idx, row in enumerate(data_list):
                    try:
                        # Extract keys case-insensitively if needed, or rely on Frontend mapping
                        # Frontend sends keys capitalized usually: 'Carga', 'Placa', 'Latitud'
                        # DeliveryPlan expects: wh_id, un, cliente_code...
                        
                        # Mapping (Adjust based on TabCargaArchivos preview headers)
                        # The preview uses headers from CSV. Let's assume CSV headers match:
                        # UN, Cliente, Sec Dir, Nombre, Dir 1, Dir 2, Latitud, Longitud, Empresa, Conductor, Placa, Carga
                        
                        delivery_plan = DeliveryPlan(
                            plan_type='PLAN_R',
                            file_source='JSON_Import',
                            uploaded_by=request.user,
                            # Map fields safely
                            wh_id=row.get('wh_id') or row.get('Wh Id'),
                            un=row.get('UN'),
                            cliente_code=row.get('Cliente'),
                            sec_dir=row.get('Sec Dir'),
                            nombre=row.get('Nombre'),
                            dir_1=row.get('Dir 1'),
                            dir_2=row.get('Dir 2'),
                            latitud=to_decimal(row.get('Latitud')),
                            longitud=to_decimal(row.get('Longitud')),
                            empresa=row.get('Empresa'),
                            conductor=row.get('Conductor'),
                            placa=row.get('Placa'),
                            carga=to_decimal(row.get('Carga'))
                        )
                        delivery_plan.save()
                        success_count += 1
                    except Exception as e:
                        failed_count += 1
                        errors.append({'row': idx + 1, 'error': str(e)})

            # Update Log
            upload_log.records_processed = total_rows
            upload_log.records_success = success_count
            upload_log.records_failed = failed_count
            upload_log.status = 'PARTIAL' if failed_count > 0 else 'SUCCESS'
            upload_log.save()
            
            return Response({
                'success': True,
                'message': f'Procesado {success_count} registros correctamente.',
                'stats': {'success': success_count, 'failed': failed_count}
            })

        # --- Legacy File Input ---
        if 'file' not in request.FILES:
             return Response({'success': False, 'message': 'No data provided'}, status=400)
             
        # ... (keep existing file logic if needed, or just return error as frontend uses JSON now)
        # For safety/backward compat, keep file logic but abbreviated here for replace
        return Response({'success': False, 'message': 'File upload deprecated via this view, use JSON'}, status=400)


class UnifiedConsultasView(APIView):
    """
    Vista unificada que consulta tanto Plan Normal (EncSolicitud) como Plan R (DeliveryPlan).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filtros
        plan_type = request.query_params.get('plan_type')
        cliente = request.query_params.get('cliente')
        placa = request.query_params.get('placa')
        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        usuario = request.query_params.get('usuario')
        carga = request.query_params.get('carga') # ID Carga or generic ref

        results = []

        # --- 1. Query Plan Normal (EncSolicitud) ---
        if not plan_type or plan_type == 'PLAN_NORMAL':
            # Avoid circular import if possible, but safe in method or if imported at top
            from logistics.models import EncSolicitud
            
            qs_normal = EncSolicitud.objects.select_related('estado').all()

            if cliente:
                qs_normal = qs_normal.filter(un_orig__icontains=cliente) # Mapping UN/Client to un_orig
            if placa:
                qs_normal = qs_normal.filter(placa__icontains=placa)
            if fecha_desde:
                qs_normal = qs_normal.filter(fecha_carge__date__gte=fecha_desde)
            if fecha_hasta:
                qs_normal = qs_normal.filter(fecha_carge__date__lte=fecha_hasta)
            if usuario:
                qs_normal = qs_normal.filter(usuario_carge__icontains=usuario)
            if carga:
                qs_normal = qs_normal.filter(carga__icontains=carga)

            # Limit query for safety if no large pagination yet, but user asked for "show on search". 
            # We fetch reasonable amount or use pagination. For now, fetch generic limit 500?
            # Or just fetch all and let frontend paginate (if data isn't huge). 
            # Given requirement "pagination in frontend", getting all matches is risky if huge. 
            # Let's cap at 1000 for safety or implement backend pagination later. 
            # User asked for "search to show", implying we might fetch what we need.
            
            for item in qs_normal[:500]:
                results.append({
                    'id': f"N-{item.id}",
                    'raw_id': item.id,
                    'plan_type': 'PLAN_NORMAL',
                    'cliente': item.un_orig,
                    'nombre_ref': 'Ver Detalle', # User requested to show in details
                    'placa': item.placa,
                    'carga': item.carga,
                    'direccion': item.direccion_1,
                    'fecha_carge': item.fecha_carge,
                    'usuario_carge': item.usuario_carge,
                    'estado': item.estado.nombre if item.estado else 'Pendiente',
                    'origen': 'Ver Detalle', # Moved to details
                    'observaciones': item.observaciones
                })

        # --- 2. Query Plan R (DeliveryPlan) ---
        if not plan_type or plan_type == 'PLAN_R':
            qs_r = DeliveryPlan.objects.filter(plan_type='PLAN_R')

            if cliente:
                qs_r = qs_r.filter(cliente_code__icontains=cliente)
            if placa:
                qs_r = qs_r.filter(placa__icontains=placa)
            if fecha_desde:
                qs_r = qs_r.filter(created_at__date__gte=fecha_desde)
            if fecha_hasta:
                qs_r = qs_r.filter(created_at__date__lte=fecha_hasta)
            if usuario:
                qs_r = qs_r.filter(uploaded_by__username__icontains=usuario)
            if carga:
                # Handle numeric search for Decimal field
                from django.db.models import CharField
                from django.db.models.functions import Cast
                qs_r = qs_r.annotate(carga_str=Cast('carga', CharField())).filter(carga_str__icontains=carga)

            for item in qs_r[:500]:
                results.append({
                    'id': f"R-{item.id}",
                    'raw_id': item.id,
                    'plan_type': 'PLAN_R',
                    'cliente': item.cliente_code,
                    'nombre_ref': item.nombre,
                    'placa': item.placa,
                    'carga': str(item.carga) if item.carga else '',
                    'direccion': item.dir_1,
                    'fecha_carge': item.created_at,
                    'usuario_carge': item.uploaded_by.username if item.uploaded_by else 'System',
                    'estado': 'Cargado', # Validar si agregamos estado a DeliveryPlan
                    'origen': item.wh_id,
                    'observaciones': '' 
                })

        # Sort combined results by Date Desc
        results.sort(key=lambda x: x['fecha_carge'] or datetime.min, reverse=True)
        
        return Response(results)


class UploadHistoryView(ListAPIView):
    """
    Vista para ver historial de cargas de archivos.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = FileUploadLogSerializer
    
    def get_queryset(self):
        queryset = FileUploadLog.objects.all()
        
        # Filtro opcional por tipo de plan
        plan_type = self.request.query_params.get('plan_type', None)
        if plan_type:
            queryset = queryset.filter(plan_type=plan_type)
        
        return queryset.order_by('-uploaded_at')


class DeliveryPlanStatsView(APIView):
    """
    Vista para obtener estadísticas de los planes de entrega.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from logistics.models import EncSolicitud
        
        # Plan Normal Stats
        total_plan_normal = EncSolicitud.objects.count()
        last_normal = EncSolicitud.objects.order_by('-fecha_carge').first()
        last_normal_date = last_normal.fecha_carge if last_normal else None
        
        # Plan R Stats
        total_plan_r = DeliveryPlan.objects.filter(plan_type='PLAN_R').count()
        last_r = DeliveryPlan.objects.filter(plan_type='PLAN_R').order_by('-created_at').first()
        last_r_date = last_r.created_at if last_r else None
        
        total_plans = total_plan_normal + total_plan_r
        
        return Response({
            'total_plans': total_plans,
            'total_plan_normal': total_plan_normal,
            'total_plan_r': total_plan_r,
            'last_normal_date': last_normal_date,
            'last_r_date': last_r_date
        })
        
class DeliveryPlanDetailsView(APIView):
    """
    Vista para obtener los detalles de un plan específico (Plan Normal o Plan R).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # pk format: "N-123" or "R-456"
        if not pk:
            return Response({'error': 'ID requerido'}, status=400)
            
        prefix, raw_id = pk.split('-')
        
        try:
            if prefix == 'N':
                from logistics.models import DetalleSolicitud, EncSolicitud
                from core.models import Articulo
                
                # Retrieve header for Origin
                enc = EncSolicitud.objects.get(id=raw_id)
                origen_val = enc.un_orig or 'S/I'

                detalles = DetalleSolicitud.objects.filter(encabezado_id=raw_id)
                
                # Manual Left Join for Articulo Description
                article_codes = [d.articulo for d in detalles if d.articulo]
                articulos_map = {
                    a.codigo: a.descripcion 
                    for a in Articulo.objects.filter(codigo__in=article_codes)
                }
                
                data = [{
                    'articulo': d.articulo,
                    'nombre_articulo': articulos_map.get(d.articulo, 'S/I'), # Left Join result
                    'cant_env': d.cant_env,
                    'total_volume': d.total_volume,
                    'um': d.um,
                    'volumen': d.volumen,
                    'remision': d.remision_transferencia,
                    'n_ped': d.n_ped,
                    'origen': origen_val # Added per request
                } for d in detalles]
                return Response(data)
                
            elif prefix == 'R':
                # Plan R logic remains same
                return Response([]) 
                
        except Exception as e:
            return Response({'error': str(e)}, status=500)
            
class DeliveryPlanExportDetailsView(APIView):
    """
    Vista para obtener TODOS los detalles basados en los mismos filtros del encabezado (para Exportar Excel).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Reutilizar filtros
        cliente = request.query_params.get('cliente')
        placa = request.query_params.get('placa')
        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        usuario = request.query_params.get('usuario')
        carga = request.query_params.get('carga')
        plan_type = request.query_params.get('plan_type')

        results = []

        # Solo Plan Normal tiene detalles estructurales complejos ahora
        if not plan_type or plan_type == 'PLAN_NORMAL':
            from logistics.models import DetalleSolicitud
            from core.models import Articulo
            
            qs = DetalleSolicitud.objects.select_related('encabezado').all()
            
            if cliente:
                qs = qs.filter(encabezado__un_orig__icontains=cliente)
            if placa:
                qs = qs.filter(encabezado__placa__icontains=placa)
            if fecha_desde:
                qs = qs.filter(encabezado__fecha_carge__date__gte=fecha_desde)
            if fecha_hasta:
                qs = qs.filter(encabezado__fecha_carge__date__lte=fecha_hasta)
            if usuario:
                qs = qs.filter(encabezado__usuario_carge__icontains=usuario)
            if carga:
                qs = qs.filter(encabezado__carga__icontains=carga)

            # Cap safety
            details_list = list(qs[:2000])
            
            # Bulk Fetch Article Descriptions
            article_codes = {d.articulo for d in details_list if d.articulo}
            articulos_map = {
                a.codigo: a.descripcion 
                for a in Articulo.objects.filter(codigo__in=article_codes)
            }

            for d in details_list:
                results.append({
                    'encabezado_id': f"N-{d.encabezado.id}",
                    'articulo': d.articulo,
                    'nombre_articulo': articulos_map.get(d.articulo, ''),
                    'cant_env': d.cant_env,
                    'total_volume': d.total_volume,
                    'um': d.um,
                    'volumen': d.volumen,
                    'remision': d.remision_transferencia,
                    'n_ped': d.n_ped
                })

        return Response(results)
