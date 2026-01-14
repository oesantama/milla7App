from logistics.models import EncSolicitud
e = EncSolicitud.objects.order_by('-id').first()
if e:
    print(f"ENCABEZADO ID: {e.id}")
    print(f"Cliente: {e.un_orig} | Pedido: {e.n_ped}")
    print(f"Placa: {e.placa} | Fecha: {e.fecha_carge}")
    print(f"Usuario: {e.usuario_carge}")
    print(f"Detalles: {e.detalles.count()} items")
    d = e.detalles.first()
    if d:
        print(f"Ej. Detalle -> Articulo: {d.articulo} | Cant: {d.cant_env} | Vol: {d.volumen}")
else:
    print("No data found")
