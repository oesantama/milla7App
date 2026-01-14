from rest_framework import views, status
from rest_framework.response import Response
from django.db.models import Sum, F
from .models import EncSolicitud, DetalleSolicitud, Recepcion, Despacho, DetalleDespacho, DetalleRecepcion
from core.models import Vehiculo
from django.db import transaction

import logging
logger = logging.getLogger(__name__)

class PendingItemsView(views.APIView):
    """
    Returns list of items (grouped by Invoice/Address) that are ready for storage/distribution.
    Source: Recepciones FINALIZADO_OK -> DetalleRecepcion -> DetalleSolicitud
    Excludes: Items already assigned to an active Despacho.
    """
    def get(self, request):
        try:
            # 1. Get all items received OK
            # We want items from Recepcion finished
            rec_detalles = DetalleRecepcion.objects.filter(
                recepcion__estado='FINALIZADO_OK',
                recepcion__encabezado__plan_type='PLAN_NORMAL' # Usually Dispatch is for Normal Plan? Or both? Assuming Normal for now.
            ).select_related('articulo', 'recepcion', 'recepcion__encabezado')
            
            # 2. Filter out items already in a Despacho?
            # Complexity: DetalleDespacho usually links by 'n_ped' (Invoice) or 'id'.
            # For simplicity MVP: We list ALL invoices found in Received items that are NOT in a Despacho.
            
            # Get distinct invoices in Despacho
            dispatched_invoices = DetalleDespacho.objects.values_list('pedido_n', flat=True)
            
            # Group by Invoice (n_ped) + Address (direccion_1)
            # We need to aggregate from DetalleSolicitud level because Recepcion links to EncSolicitud
            
            # Strategy: Go through EncSolicitud -> DetalleSolicitud for items that have a Recepcion
            # This might be heavy. Alternative:
            
            data = []
            
            # Unique Recepciones
            recepciones = rec_detalles.values_list('recepcion', flat=True).distinct()
            encabezados = EncSolicitud.objects.filter(recepciones__in=recepciones).distinct()
            
            for enc in encabezados:
                # Check if this invoice is already dispatched
                if enc.n_ped in dispatched_invoices:
                    continue
                
                # Calculate Volume/Weight for this Invoice based on RECEIVED items
                # (We only ship what we received)
                
                total_vol = 0
                total_items = 0
                
                # Get received details for this enc
                detalles_rx = rec_detalles.filter(recepcion__encabezado=enc)
                
                item_list = []
                for d in detalles_rx:
                    # Generic volume calc if not present: 0.01
                    # In real app, Articulo model should have dimensions. 
                    # Here we might rely on DetalleSolicitud original volume or count.
                    # Let's assume passed volume or simple count.
                    
                    vol = 0.1 # Default placeholder if no volume data
                    # Try to find original detail to get volume
                    # This link missing in current model structure (DetalleRecepcion -> Articulo, but not specific DetalleSolicitud)
                    # We will approximate or use total from Enc if available.
                    
                    total_vol += vol * d.cantidad_contada_base
                    total_items += d.cantidad_contada_base
                    
                    item_list.append({
                        'articulo': d.articulo.descripcion if d.articulo else 'N/A',
                        'cantidad': d.cantidad_contada_base
                    })
                
                data.append({
                    'id': enc.id,
                    'n_ped': enc.n_ped or 'S/N',
                    'cliente': enc.un_orig, # Mapping un_orig as Client/UN
                    'direccion': enc.direccion_1 or 'Sin Dirección',
                    'volumen': round(total_vol, 2),
                    'items_count': total_items,
                    'items': item_list
                })
                
            return Response(data)
        except Exception as e:
            logger.error(f"Error fetching pending items: {e}")
            return Response({"error": str(e)}, status=500)

class AutoRouteView(views.APIView):
    """
    Suggests route distribution using 90% capacity rule.
    """
    def post(self, request):
        try:
            invoices = request.data.get('invoices', []) # List of invoice objects {n_ped, volumen, direccion, ...}
            if not invoices:
                return Response({'error': 'No invoices provided'}, status=400)
                
            # 1. Get Available Vehicles
            # Updated to use MasterEstado relationship
            vehiculos = Vehiculo.objects.filter(estado__descripcion__iexact='Disponible', eliminado=False)
            if not vehiculos.exists():
                return Response({'error': 'No vehicles available (marked as Disponible)'}, status=400)
            
            # 2. Sort Vehicles by Capacity (Larger first?)
            # Handle null cubicaje
            vehs = []
            for v in vehiculos:
                cap = float(v.cubicaje) if v.cubicaje else 0.0
                if cap <= 0: cap = 9999.0 # Treat unknown as infinite/large for now? Or skip?
                
                vehs.append({
                    'id': v.id,
                    'placa': v.placa,
                    'capacidad_real': cap,
                    'capacidad_90': cap * 0.90,
                    'asignado_vol': 0.0,
                    'facturas': []
                })
            
            vehs.sort(key=lambda x: x['capacidad_90'], reverse=True)
            
            # 3. Group Invoices by Address (Clustering)
            clusters = {}
            for inv in invoices:
                addr = inv.get('direccion', 'UNK').strip().upper()
                if addr not in clusters: clusters[addr] = []
                clusters[addr].append(inv)
            
            # 4. Bin Packing (First Fit Decreasing by Cluster Volume)
            # Calculate cluster volumes
            cluster_list = []
            for addr, items in clusters.items():
                vol = sum(float(i.get('volumen', 0)) for i in items)
                cluster_list.append({'addr': addr, 'items': items, 'vol': vol})
            
            # Sort clusters by volume descending
            cluster_list.sort(key=lambda x: x['vol'], reverse=True)
            
            unassigned = []
            
            for cluster in cluster_list:
                assigned = False
                # Try to fit in first vehicle that has space
                for v in vehs:
                    if v['asignado_vol'] + cluster['vol'] <= v['capacidad_90']:
                        v['asignado_vol'] += cluster['vol']
                        v['facturas'].extend(cluster['items'])
                        assigned = True
                        break
                
                if not assigned:
                    # If logical capacity exceeded, force assign to 'Overflow' or largest vehicle?
                    # For now, mark unassigned
                    unassigned.extend(cluster['items'])
            
            return Response({
                'routes': vehs,
                'unassigned': unassigned
            })

        except Exception as e:
            logger.error(f"Error auto-routing: {e}")
            return Response({"error": str(e)}, status=500)

class SaveRouteView(views.APIView):
    def post(self, request):
        try:
            routes = request.data.get('routes', [])
            
            with transaction.atomic():
                saved_ids = []
                for r in routes:
                    if not r.get('facturas'): continue
                    
                    # Create Despacho
                    desp = Despacho.objects.create(
                        vehiculo_id=r.get('id'), # Vehicle ID
                        estado='PLANIFICADO',
                        capacidad_ocupada=r.get('asignado_vol', 0)
                    )
                    
                    # Create Details
                    for f in r['facturas']:
                        DetalleDespacho.objects.create(
                            despacho=desp,
                            pedido_n=f.get('n_ped'),
                            direccion=f.get('direccion'),
                            volumen_total=f.get('volumen', 0)
                        )
                    saved_ids.append(desp.id)
                    
            return Response({'status': 'success', 'created_ids': saved_ids})
        except Exception as e:
            return Response({"error": str(e)}, status=500)
