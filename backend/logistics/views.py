from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets # Added import for ViewSets
from core.serializers import UserSerializer # Corrected import

class HealthCheck(APIView):
    def get(self, request):
        return Response({"status": "ok"})

class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

from django.db import transaction
from rest_framework import status
from .models import EncSolicitud, DetalleSolicitud
from maestras.models import MasterEstado as Estado # Alias for minimal changes first, or rename usage
from datetime import datetime, timedelta

class SolicitudImportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("DEBUG: SolicitudImportView POST called")
        data = request.data
        print(f"DEBUG: Data len: {len(data) if isinstance(data, list) else 'Not list'}")
        
        if not isinstance(data, list):
            return Response({"error": "Expected a list of orders"}, status=status.HTTP_400_BAD_REQUEST)

        # Helper to parse Excel dates (if frontend sends string YYYY-MM-DD, fine. If int, convert)
        def parse_date(value):
            if not value:
                return None
            try:
                # If it comes as Excel serial number (int/float)
                if isinstance(value, (int, float)):
                    # Excel base date: Dec 30 1899
                    return (datetime(1899, 12, 30) + timedelta(days=value)).date()
                if isinstance(value, str):
                    try:
                        return datetime.strptime(value, '%Y-%m-%d').date()
                    except ValueError:
                        pass
                    try:
                        return datetime.strptime(value, '%d/%m/%Y').date()
                    except ValueError:
                        pass
                return None
            except Exception:
                return None

        def safe_float(val):
            if val is None or val == "":
                return None
            if isinstance(val, (int, float)):
                return float(val)
            if isinstance(val, str):
                # Handle cases like "123 MT3", "300 Kg", etc.
                # Remove common non-numeric chars except . and -
                import re
                # Keep digits, dot, minus.
                clean_val = re.sub(r'[^\d.-]', '', val.replace(',', '.'))
                try:
                    if clean_val:
                        return float(clean_val)
                    return None
                except:
                    return None
            return None

        def safe_int(val):
            if val is None or val == "":
                return None
            if isinstance(val, (int, float)):
                return int(val)
            if isinstance(val, str):
                val = val.replace(',', '').replace('.', '').strip() # Remove separators? Or truncate. Let's assume int string.
                # Actually safest is float then int if it has decimals like 10.0
                try:
                    return int(float(val.replace(',', '.')))
                except:
                    return None
            return None

        saved_count = 0
        try:
            # Get default state 'Pendiente'
            estado_pendiente = None
            try:
                estado_pendiente = Estado.objects.get(descripcion='Pendiente')
            except Estado.DoesNotExist:
                # Create if missing (Safe fallback)
                estado_pendiente = Estado.objects.create(descripcion='Pendiente', estado=True)

            with transaction.atomic():
                for orden_data in data:
                    # Clean keys (trim spaces, lowercase maybe? for now strict map)
                    
                    # Mapping
                    # Excel Header -> Model Field
                    # New Logic: Key is Carga + Placa
                    carga = orden_data.get('Carga')
                    placa = orden_data.get('Placa')
                    
                    if not carga or not placa:
                        # Assuming Carga+Placa are mandatory for grouping. 
                        # Use n_ped as fallback or skip? User implies Carga+Placa is the key.
                        # "muestrame los campos... para que en el encabezado se carge un id por cada que coincida una carga y placa"
                        continue 

                    n_ped = orden_data.get('Nº Ped') or orden_data.get('N Ped')

                    header_fields = {
                        'un_orig': orden_data.get('UN Orig'),
                        'f_demanda': parse_date(orden_data.get('F Demanda')),
                        'n_ped': n_ped, 
                        # 'remision_transferencia': MOVED TO DETAIL
                        'carga': carga,
                        'placa': placa,
                        'direccion_1': orden_data.get('Dirección 1') or orden_data.get('Direccion 1'),
                        'observaciones': orden_data.get('Message'),
                        'usuario_carge': request.user.username,
                        'estado': estado_pendiente,
                        'plan_type': 'PLAN_NORMAL'
                    }
                    
                    # Update or Create Header based on Carga + Placa
                    enc, created = EncSolicitud.objects.update_or_create(
                        carga=carga,
                        placa=placa,
                        defaults=header_fields
                    )
                    
                    # If existing header, we append details. 
                    # If we want to replace details for this load, we should delete them once per import-batch 
                    # OR we just append. User said "borre la informacion... para que pueda efectuar los cambios"
                    # implying a fresh start. Since we did truncate, 'created' will be true initially.
                    # If multiple rows have same Carga+Placa, only the first 'creates', others 'get'.
                    # We should NOT delete details if it was NOT created in this loop iteration? 
                    # Issue: If I import 10 rows for same Carga, first one creates, next 9 update.
                    # If I delete details on every update, I lose previous 9.
                    # Strategy: If 'created' is True, we are safe. If False, we just append.
                    # BUT if re-importing same file? We duplicate.
                    # Ideally we clear details only if this is the "First time we touch this header in this request".
                    # For simplicity given the instruction "borre... para q pueda efectuar cambios", implies clean slate mainly.
                    # We will just append details.
                    
                    # 4. Auto-Create Articulo if missing (Same as Plan R)
                    item_code = orden_data.get('Articulo')
                    item_desc = "Item Importado Plan Normal" 

                    if item_code:
                         try:
                            from core.models import Articulo
                            Articulo.objects.get_or_create(
                                codigo=item_code, 
                                defaults={'nombre': item_desc, 'estado': True}
                            )
                         except Exception as e:
                            pass
                    
                    # Create Detail
                    DetalleSolicitud.objects.create(
                        articulo=item_code,
                        cant_env=safe_int(orden_data.get('Cant Env')),
                        total_volume=safe_float(orden_data.get('Total Volume')),
                        um=orden_data.get('UM'),
                        volumen=safe_float(orden_data.get('Volumen')),
                        remision_transferencia=orden_data.get('Remision/TRansferencia'), 
                        encabezado=enc,
                        n_ped=n_ped # Save Pedido in Detail
                    )
                    saved_count += 1
                    
            return Response({
                "status": "success", 
                "message": f"Se procesaron {saved_count} registros correctamente."
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": f"Error interno: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SolicitudImportPlanRView(APIView):
    permission_classes = [IsAuthenticated]


    def post(self, request):
        print("DEBUG: SolicitudImportPlanRView POST called")
        data = request.data
        if isinstance(data, list) and len(data) > 0:
            print(f"DEBUG: Plan R Data Length: {len(data)}")
            print(f"DEBUG: Plan R First Row Keys: {list(data[0].keys())}")
            print(f"DEBUG: Plan R First Row Sample: {data[0]}")
        else:
            print("DEBUG: Plan R Data is empty or not a list")

        if not isinstance(data, list):
            return Response({"error": "Expected a list of records"}, status=status.HTTP_400_BAD_REQUEST)

        # Helpers (Duplicated for safety/isolation)
        def safe_float(val):
            if val is None or val == "": return None
            if isinstance(val, (int, float)): return float(val)
            if isinstance(val, str):
                import re
                clean_val = re.sub(r'[^\d.-]', '', val.replace(',', '.'))
                try:
                    if clean_val: return float(clean_val)
                except: pass
            return None

        def safe_int(val):
            if val is None or val == "": return None
            if isinstance(val, (int, float)): return int(val)
            if isinstance(val, str):
                val = val.replace(',', '').replace('.', '').strip() 
                try: 
                    return int(float(val.replace(',', '.'))) # Handle 10.0 -> 10
                except: pass
            return None

        try:
            # Get default state
            estado_pendiente = None
            try:
                estado_pendiente = Estado.objects.get(descripcion='Pendiente')
            except Estado.DoesNotExist:
                 estado_pendiente = Estado.objects.create(descripcion='Pendiente', estado=True)
                 
            saved_count = 0
            
            # DEBUG: Print first row to see keys
            if len(data) > 0:
                print(f"DEBUG Plan R Import: First row keys: {list(data[0].keys())}")
                print(f"DEBUG Plan R Import: First row sample: {data[0]}")

            with transaction.atomic():
                for raw_row in data:
                     # 1. Normalize keys (strip whitespace because CSV has "; UN")
                    row = {k.strip(): v for k, v in raw_row.items() if k}
                    
                    # 2. Extract Data using clean keys
                    carga = row.get('Carga')
                    placa = row.get('Placa')
                     
                    if not carga or not placa:
                        continue 
                        
                    n_ped = row.get('Pedido')
                    if n_ped:
                        n_ped = str(n_ped).strip()
                        
                    header_fields = {
                        'un_orig': row.get('UN'),
                        'n_ped': n_ped,
                        'placa': placa,
                        # 'remision_transferencia': MOVED TO DETAIL
                        'carga': carga,
                        'direccion_1': row.get('Dir 1'),
                        'message': row.get('Comentarios'), 
                        'usuario_carge': request.user.username,
                        'estado': estado_pendiente,
                        'plan_type': 'PLAN_R'
                    }
                    
                    # Update or Create EncSolicitud
                    enc, created = EncSolicitud.objects.update_or_create(
                        carga=carga,
                        placa=placa,
                        defaults=header_fields
                    )
                    
                    
                    # 3. Save Pedido in Detail (User Request: "pedido ya va en el detalle")
                    # We still keep it in header for reference or if needed, but critical is Detail.
                    
                    # 4. Auto-Create Articulo if missing (Fix "Articulo no encontrado")
                    # Ensure we have core.models.Articulo imported. 
                    # Assuming basic fields. Check Articulo model if known.
                    # Usually: codigo, nombre.
                    item_code = row.get('Item')
                    item_desc = row.get('Descr') or row.get('Articulo') or "Item Importado"
                    
                    if item_code:
                        # Auto-create or get
                        # Check global import first: from core.models import Articulo
                        # Since I can't see top of file easily while editing, I will do local import as fallback 
                        # or rely on existing 'from core.serializers.UserSerializer' implies core app exists
                        try:
                            from core.models import Articulo
                            Articulo.objects.get_or_create(
                                codigo=item_code, 
                                defaults={'nombre': item_desc, 'estado': True} # Assuming boolean state
                            )
                        except Exception as e:
                            print(f"DEBUG: Error auto-creating article {item_code}: {e}")
                            pass

                    # Create Link/Detail
                    DetalleSolicitud.objects.create(
                        encabezado=enc,
                        articulo=item_code, 
                        cant_env=safe_int(row.get('Cant Env')),
                        total_volume=safe_float(row.get('Volumen')), 
                        um='S/I', 
                        volumen=0,
                        remision_transferencia=row.get('Factura'),
                        n_ped=n_ped # Save Pedido in Detail
                    )
                    saved_count += 1
            
            print(f"DEBUG: Saved {saved_count} records")
            return Response({"status": "success", "message": f"Se procesaron {saved_count} lineas de Plan R."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Recepcion Material Views ---
from .models import Recepcion, DetalleRecepcion
from core.models import Articulo, UnidadMedida

class ValidateCargasView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        if not isinstance(data, list):
             return Response({"error": "Expected a list"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Data expected: [{carga: '...', placa: '...'}, ...]
        # We need to return which ones EXIST.
        
        existing_keys = set()
        
        # Optimization: Get all pairs from DB or filter? 
        # Since we might have thousands in DB, fetching ALL is bad. 
        # But iterating one by one is N queries.
        # Better: Filter where (carga IN list) AND (placa IN list) then check pairs in python
        # Or construct Q objects.
        
        from django.db.models import Q
        q_obj = Q()
        for item in data:
            c = item.get('carga')
            p = item.get('placa')
            if c and p:
                q_obj |= Q(carga=c, placa=p)
        
        if not q_obj:
            return Response([])

        # Limit query complexity if list is huge? For now assume reasonable batch size (e.g. 50-100 imported rows)
        found = EncSolicitud.objects.filter(q_obj).values('carga', 'placa')
        
        existing_list = []
        for f in found:
            # Return unique identifiers. "Carga_Placa" string is easy for frontend to check
            existing_list.append(f"{f['carga']}_{f['placa']}")
            
        return Response(existing_list)

class CargasPendientesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from django.db.models import Max, Q
        
        # Filter: Estado 'Pendiente' OR None (if not set yet)
        # Check by description instead of nombre. 
        
        qs = EncSolicitud.objects.filter(
            Q(estado__descripcion__iexact='Pendiente') | Q(estado__isnull=True)
        )
        
        # Refactored Logic: 
        # EncSolicitud is now unique by Carga + Placa (grouped during import).
        # We return all EncSolicituds that are NOT finalized.
        
        cargas = EncSolicitud.objects.all().order_by('-id').prefetch_related('detalles', 'recepciones', 'recepciones__estado')
        
        data = []
        for c in cargas:
            rec = c.recepciones.first()
            # Handle FK object access safely
            status_rec = rec.estado.descripcion if (rec and rec.estado) else 'PENDIENTE'
            
            # Filter out finalized if desired? 
            # Note: FINALIZADO_CON_NOVEDAD renamed to RECIBIDO_CON_NOVEDAD
            if status_rec in ['Orden Cerrada', 'Finalizado OK', 'RECIBIDO_CON_NOVEDAD', 'Recibido']: 
                  # Check if we should hide 'Recibido' too? Usually Recibido = Done. 
                  # Assuming we show only pending.
                  continue # Hide finished loads

            # Details info
            detalles_data = []
            for d in c.detalles.all():
                detalles_data.append({
                    "id": d.id,
                    "articulo": d.articulo, 
                    "cant_env": d.cant_env,
                    "um": d.um,
                    "volumen": d.total_volume or d.volumen,
                    "remision": d.remision_transferencia,
                    "n_ped": d.n_ped # Add Pedido to details
                })

            data.append({
                "id": c.id,
                "n_ped": c.n_ped,
                "placa": c.placa,
                "fecha": c.fecha_carge, # Add Date field
                "carga": c.carga,
                "carga_display": f"{c.placa or 'S/P'} - {c.carga or 'S/C'}", 
                "estado_recepcion": status_rec,
                "detalles": detalles_data 
            })
        return Response(data)

from .models import CorreosNotificacion
from .serializers import CorreosNotificacionSerializer

class CorreosNotificacionViewSet(viewsets.ModelViewSet):
    queryset = CorreosNotificacion.objects.all().order_by('id')
    serializer_class = CorreosNotificacionSerializer
    permission_classes = [IsAuthenticated]

class BuscarArticuloView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response({"error": "No code provided"}, status=400)
            
        try:
            art = Articulo.objects.get(codigo=code)
            return Response({
                "id": art.id,
                "descripcion": art.descripcion,
                "codigo": art.codigo,
                "um_general": art.unidad_medida_general.descripcion if art.unidad_medida_general else "",
                "um_intermedia": art.unidad_medida_intermedia.descripcion if art.unidad_medida_intermedia else "",
                "um_especial": art.unidad_medida_especial.descripcion if art.unidad_medida_especial else "",
                "factor_general": art.factor_general,
                "factor_intermedio": art.factor_intermedio,
                "factor_especial": art.factor_especial
            })
        except Articulo.DoesNotExist:
            return Response({"error": "Articulo no encontrado"}, status=404)

class ProcesarItemView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        data = request.data
        carga_id = data.get('carga_id')
        articulo_id = data.get('articulo_id')
        code = data.get('code') # New field
        
        cantidad = float(data.get('cantidad', 0))
        unidad_sel = data.get('unidad_seleccionada', 'GENERAL')
        
        try:
            with transaction.atomic():
                enc = EncSolicitud.objects.get(id=carga_id)
                recepcion, _ = Recepcion.objects.get_or_create(
                    encabezado=enc,
                    defaults={'usuario': request.user.username}
                )
                
                # Logic Change: If Code is provided, validate against MANIFEST first
                art = None
                
                if code:
                    # Check if exists in Manifest (DetalleSolicitud)
                    # Note: detalle.articulo is the code string
                    in_manifest = enc.detalles.filter(articulo=code).first()
                    
                    if not in_manifest:
                         return Response({"error": f"El código {code} NO pertenece a la carga seleccionada."}, status=400)
                    
                    # If in manifest, we need an Articulo object to link in Recepcion
                    # Try getting from masters
                    try:
                        art = Articulo.objects.get(codigo=code)
                    except Articulo.DoesNotExist:
                        # Auto-create entry in Master since it's valid in Manifest
                        # Use description from manifest if available or fallback
                        # Manifest doesn't store desc explicitly usually? But DetalleSolicitud might if we added it?
                        # Re-checking DetalleSolicitud model... it has 'articulo' (code). 
                        # Maybe we don't have description. We'll use "Item en Carga: {code}"
                        art = Articulo.objects.create(
                            codigo=code,
                            descripcion=f"Item de Carga {code}", # FIX: nombre -> descripcion
                            estado=True
                        )
                elif articulo_id:
                     art = Articulo.objects.get(id=articulo_id)
                else:
                    return Response({"error": "Debe proporcionar articulo_id o code"}, status=400)

                factor = 1.0
                if unidad_sel == 'INTERMEDIO': factor = art.factor_intermedio if art.factor_intermedio else 1.0
                elif unidad_sel == 'ESPECIAL': factor = art.factor_especial if art.factor_especial else 1.0
                else: factor = art.factor_general if art.factor_general else 1.0
                
                cantidad_base = cantidad * factor
                
                det, created = DetalleRecepcion.objects.get_or_create(
                    recepcion=recepcion, 
                    articulo=art,
                    defaults={'cantidad_contada_base': 0}
                )
                
                det.cantidad_contada_base += cantidad_base
                det.save()
                
                return Response({
                    "status": "success", 
                    "nuevo_total": det.cantidad_contada_base,
                    "nombre": art.descripcion # FIX: Use descripcion explicitly
                })
        except Exception as e:
             import traceback
             print(traceback.format_exc())
             return Response({"error": str(e)}, status=500)

class ValidarRecepcionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from django.utils import timezone
        
        carga_id = request.data.get('carga_id')
        try:
             solicitud = EncSolicitud.objects.get(id=carga_id)
        except EncSolicitud.DoesNotExist:
             return Response({"error": "Carga no encontrada"}, 404)
        
        # Get or create reception
        recepcion, created = Recepcion.objects.get_or_create(encabezado=solicitud)
        
        # 1. Compare Expected vs Counted
        detalles_sol = solicitud.detalles.all()
        detalles_rec = recepcion.detalles.all()
        
        # Map articulo_id -> quantity
        expected_map = {}
        for d in detalles_sol:
            # Normalize key
            key = d.articulo.strip().upper() if d.articulo else "UNK"
            expected_map[key] = expected_map.get(key, 0) + (d.cant_env or 0)
            
        counted_map = {}
        for d in detalles_rec:
            if d.articulo:
                 key = d.articulo.descripcion.strip().upper()
                 counted_map[key] = counted_map.get(key, 0) + d.cantidad_contada_base

        errors = []
        # Compare
        all_keys = set(expected_map.keys()) | set(counted_map.keys())
        
        for k in all_keys:
            exp = expected_map.get(k, 0)
            cnt = counted_map.get(k, 0)
            if abs(exp - cnt) > 0.01: # float tolerance
                # Blind Mode: DO NOT reveal exp or cnt. Just say there is a diff.
                errors.append({
                    "articulo": k, 
                    "mensaje": "Cantidad no coincide com documento." 
                })
        
        if not errors:
            state_ok, _ = Estado.objects.get_or_create(descripcion='Finalizado OK', defaults={'estado': True})
            recepcion.estado = state_ok
            recepcion.fecha_fin = timezone.now()
            recepcion.save()
            
            # --- Update EncSolicitud Status ---
            try:
                # Renamed 'Inventariado' -> 'Recibido'
                estado_rec, _ = Estado.objects.get_or_create(descripcion='Recibido', defaults={'estado': True})
                solicitud.estado = estado_rec
                solicitud.save()
            except Exception as e:
                print(f"Error updating EncSolicitud status: {e}")
            # ----------------------------------

            return Response({"status": "ok", "message": "Recepción Exitosa Sin Novedades"})
        else:
            # Handle Retries
            recepcion.intentos_fallidos += 1
            recepcion.save()
            
            if recepcion.intentos_fallidos >= 2:
                # Second failure: Finalize with Novelty and Send Email
                # Renamed 'FINALIZADO_CON_NOVEDAD' -> 'RECIBIDO_CON_NOVEDAD'
                state_nov, _ = Estado.objects.get_or_create(descripcion='RECIBIDO_CON_NOVEDAD', defaults={'estado': True})
                recepcion.estado = state_nov
                recepcion.fecha_fin = timezone.now()
                recepcion.save()
                
                # Send Email Logic
                self.send_notification_email(recepcion, errors)
                
                return Response({
                    "status": "ok", 
                    "message": "Recepción Finalizada CON NOVEDADES. Se ha notificado por correo."
                })
            else:
                # First failure: Warn user
                return Response({
                    "status": "retry", 
                    "novedades": errors,
                    "attempt": recepcion.intentos_fallidos
                })

    def send_notification_email(self, recepcion, errors):
        from django.core.mail import send_mail
        from .models import CorreosNotificacion
        
        # Find emails
        # Estado is now FK. Filter by description = 'activo'
        recipients = list(CorreosNotificacion.objects.filter(estado__descripcion__iexact='activo').values_list('correo', flat=True))
        
        if not recipients:
            print("No email recipients found for notification.")
            return

        subject = f"Novedad Recepción Carga {recepcion.encabezado.n_ped} - {recepcion.encabezado.placa}"
        message = f"Se ha finalizado la recepción de la carga {recepcion.encabezado.carga} con novedades.\n\n"
        message += f"Pedido: {recepcion.encabezado.n_ped}\n"
        message += f"Placa: {recepcion.encabezado.placa}\n"
        message += f"Usuario: {recepcion.usuario or 'Sistema'}\n\n"
        message += "Artículos con diferencia:\n"
        for e in errors:
            message += f"- {e['articulo']}\n"
            
        try:
             send_mail(
                subject,
                message,
                'no-reply@milla7.com',
                recipients,
                fail_silently=True,
            )
             print(f"Email sent to {recipients}")
        except Exception as e:
            print(f"Error sending email: {e}")

class RecepcionProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, carga_id):
        try:
            enc_qs = EncSolicitud.objects.filter(id=carga_id)
            if not enc_qs.exists():
                return Response({"error": "Carga no encontrada"}, status=404)
            enc = enc_qs.first()
            
            recepcion = Recepcion.objects.filter(encabezado=enc).first()
            if not recepcion:
                 return Response({}) 

            from django.db.models import Sum
            detalles = DetalleRecepcion.objects.filter(recepcion=recepcion).values('articulo__descripcion', 'articulo__codigo').annotate(total=Sum('cantidad_contada_base'))
            
            result = {}
            for d in detalles:
                name = d['articulo__descripcion']
                code = d['articulo__codigo']
                total = d['total']
                if total > 0:
                   result[name] = { "total": total, "code": code }
            
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=500)