# ruta: backend/core/views.py
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import (
    VehiculoSerializer, ConductorSerializer, ClienteSerializer, 
    TipoVehiculoSerializer, CategoriaSerializer, ArticuloSerializer,
    UnidadMedidaSerializer
)
from .models import Vehiculo, Conductor, Cliente, TipoVehiculo, Categoria, Articulo, UnidadMedida

class VehiculoViewSet(viewsets.ModelViewSet):
    serializer_class = VehiculoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'placa'

    def get_queryset(self):
        queryset = Vehiculo.objects.all().order_by('-fecha_creacion')
        
        can_see_deleted = False
        if self.request.user.is_superuser:
            can_see_deleted = True
        elif hasattr(self.request.user, 'profile') and self.request.user.profile.role:
             if self.request.user.profile.role.id_rol == 1:
                can_see_deleted = True
        
        if not can_see_deleted:
            queryset = queryset.filter(eliminado=False)
        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario_creacion=self.request.user)

    def perform_update(self, serializer):
        serializer.save(usuario_modificacion=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Soft delete: cambiar eliminado a True en lugar de eliminar"""
        instance = self.get_object()
        instance.eliminado = True
        instance.usuario_modificacion = request.user
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ConductorViewSet(viewsets.ModelViewSet):
    serializer_class = ConductorSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'cedula'

    def get_queryset(self):
        queryset = Conductor.objects.all().order_by('-fecha_creacion')
        
        can_see_deleted = False
        if self.request.user.is_superuser:
            can_see_deleted = True
        elif hasattr(self.request.user, 'profile') and self.request.user.profile.role:
             if self.request.user.profile.role.id_rol == 1:
                can_see_deleted = True
        
        if not can_see_deleted:
            queryset = queryset.filter(eliminado=False)
        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario_creacion=self.request.user)

    def perform_update(self, serializer):
        serializer.save(usuario_modificacion=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Soft delete: cambiar eliminado a True en lugar de eliminar"""
        instance = self.get_object()
        instance.eliminado = True
        instance.usuario_modificacion = request.user
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ClienteViewSet(viewsets.ModelViewSet):
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Cliente.objects.all().order_by('-fecha_creacion')
        
        can_see_deleted = False
        if self.request.user.is_superuser:
            can_see_deleted = True
        elif hasattr(self.request.user, 'profile') and self.request.user.profile.role:
             if self.request.user.profile.role.id_rol == 1:
                can_see_deleted = True
        
        if not can_see_deleted:
            queryset = queryset.filter(eliminado=False)
        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario_creacion=self.request.user)

    def perform_update(self, serializer):
        serializer.save(usuario_modificacion=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Soft delete: cambiar eliminado a True en lugar de eliminar"""
        instance = self.get_object()
        instance.eliminado = True
        instance.usuario_modificacion = request.user
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TipoVehiculoViewSet(viewsets.ModelViewSet):
    serializer_class = TipoVehiculoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = TipoVehiculo.objects.all().order_by('-fecha_creacion')
        
        can_see_deleted = False
        if self.request.user.is_superuser:
            can_see_deleted = True
        elif hasattr(self.request.user, 'profile') and self.request.user.profile.role:
             if self.request.user.profile.role.id_rol == 1:
                can_see_deleted = True
        
        if not can_see_deleted:
            queryset = queryset.filter(eliminado=False)
        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario_creacion=self.request.user)

    def perform_update(self, serializer):
        serializer.save(usuario_modificacion=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.eliminado = True
        instance.usuario_modificacion = request.user
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CategoriaViewSet(viewsets.ModelViewSet):
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Categoria.objects.all().order_by('-fecha_creacion')
        
        can_see_deleted = False
        if self.request.user.is_superuser:
            can_see_deleted = True
        elif hasattr(self.request.user, 'profile') and self.request.user.profile.role:
             if self.request.user.profile.role.id_rol == 1:
                can_see_deleted = True
        
        if not can_see_deleted:
            queryset = queryset.filter(eliminado=False)
        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario_creacion=self.request.user)

    def perform_update(self, serializer):
        serializer.save(usuario_modificacion=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.eliminado = True
        instance.usuario_modificacion = request.user
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ArticuloViewSet(viewsets.ModelViewSet):
    serializer_class = ArticuloSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Articulo.objects.all().order_by('-fecha_creacion')
        
        can_see_deleted = False
        if self.request.user.is_superuser:
            can_see_deleted = True
        elif hasattr(self.request.user, 'profile') and self.request.user.profile.role:
             if self.request.user.profile.role.id_rol == 1:
                can_see_deleted = True
        
        if not can_see_deleted:
            queryset = queryset.filter(eliminado=False)
        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario_creacion=self.request.user)

    def perform_update(self, serializer):
        serializer.save(usuario_modificacion=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.eliminado = True
        instance.usuario_modificacion = request.user
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UnidadMedidaViewSet(viewsets.ModelViewSet):
    serializer_class = UnidadMedidaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = UnidadMedida.objects.all().order_by('-fecha_creacion')
        
        can_see_deleted = False
        if self.request.user.is_superuser:
            can_see_deleted = True
        elif hasattr(self.request.user, 'profile') and self.request.user.profile.role:
             if self.request.user.profile.role.id_rol == 1:
                can_see_deleted = True
        
        if not can_see_deleted:
            queryset = queryset.filter(eliminado=False)
        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario_creacion=self.request.user)

    def perform_update(self, serializer):
        serializer.save(usuario_modificacion=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.eliminado = True
        instance.usuario_modificacion = request.user
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

# --- Master Import View ---
class ImportMasterView(viewsets.ViewSet):
    """
    Generic View to handle bulk import of Master Data.
    Expects payload: { "model": "articulos", "data": [ {row}, ... ] }
    """
    permission_classes = [IsAuthenticated]

    def create(self, request):
        model_name = request.data.get('model')
        data = request.data.get('data')
        
        if not model_name or not data or not isinstance(data, list):
            return Response({"error": "Invalid payload. 'model' and 'data' (list) required."}, status=400)
            
        try:
            from django.db import transaction
            
            saved_count = 0
            errors = []
            
            # Atomic transaction: If any error occurs, rollback everything (optional, but good for consistency)
            # Or we can skip errors and report them. Let's try to save valid ones and report errors? 
            # User said "debe validar", usually implies blocking if invalid. 
            # Let's go with "Atomic" for safety, or partial? 
            # Given the request "validaciones o nota donde las foraneas deben existir", atomic is safer for integrity.
            
            with transaction.atomic():
                if model_name == 'articulos':
                    saved_count, errors = self._import_articulos(data, request.user)
                elif model_name == 'vehiculos':
                    saved_count, errors = self._import_vehiculos(data, request.user)
                elif model_name == 'conductores':
                    saved_count, errors = self._import_conductores(data, request.user)
                elif model_name == 'clientes':
                    saved_count, errors = self._import_clientes(data, request.user)
                elif model_name == 'tipos_vehiculos':
                    saved_count, errors = self._import_generic(data, TipoVehiculo, 'descripcion', request.user)
                elif model_name == 'categorias':
                    saved_count, errors = self._import_generic(data, Categoria, 'descripcion', request.user)
                elif model_name == 'unidades_medida':
                     saved_count, errors = self._import_unidades_medida(data, request.user)
                else:
                    return Response({"error": f"Model '{model_name}' not supported for import."}, status=400)

                if errors:
                    # If we want to blocking behavior if any error exists:
                    # raise Exception("Validation Failed")
                    # For now, let's rollback and return errors
                    transaction.set_rollback(True)
                    return Response({"status": "error", "message": "Errores de validación encontrados.", "errors": errors}, status=400)

            return Response({"status": "success", "message": f"Se procesaron {saved_count} registros exitosamente."})

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=500)

    # --- Helpers ---
    def _clean_key(self, row, key):
        """Helper to find case-insensitive key in row"""
        found = next((k for k in row.keys() if k.strip().lower() == key.lower()), None)
        return row[found] if found else None

    def _import_generic(self, data, ModelClass, unique_field, user):
        count = 0
        errors = []
        seen_keys = set()
        
        for i, row in enumerate(data):
            row_idx = i + 1
            val = self._clean_key(row, unique_field) or self._clean_key(row, 'Nombre') or self._clean_key(row, 'Descripcion')
            
            if not val: 
                errors.append(f"Fila {row_idx}: Falta campo requerido '{unique_field}'")
                continue
            
            val_clean = val.strip()
            val_lower = val_clean.lower()
            
            # 1. Intra-file duplicate check
            if val_lower in seen_keys:
                errors.append(f"Fila {row_idx}: El registro '{val_clean}' está repetido en el archivo.")
                continue
            seen_keys.add(val_lower)

            # 2. Database existence check
            if ModelClass.objects.filter(**{f"{unique_field}__iexact": val_clean}).exists():
                errors.append(f"Fila {row_idx}: El registro '{val_clean}' ya existe en la base de datos.")
                continue
            
            try:
                # 3. Create only (no update)
                obj = ModelClass(
                    **{unique_field: val_clean},
                    estado=True,
                    eliminado=False,
                    usuario_creacion=user
                )
                obj.save()
                count += 1
            except Exception as e:
                errors.append(f"Fila {row_idx}: Error al guardar {val} - {str(e)}")
                
        return count, errors

    def _import_unidades_medida(self, data, user):
        count = 0
        errors = []
        seen_keys = set()
        
        for i, row in enumerate(data):
            row_idx = i + 1
            desc = self._clean_key(row, 'Descripcion')
            abrev = self._clean_key(row, 'Abreviatura')
            if not desc: 
                errors.append(f"Fila {row_idx}: Falta descripción")
                continue
            
            val_clean = desc.strip()
            val_lower = val_clean.lower()

            # 1. Intra-file duplicate check
            if val_lower in seen_keys:
                errors.append(f"Fila {row_idx}: La unidad '{val_clean}' está repetida en el archivo.")
                continue
            seen_keys.add(val_lower)

            # 2. Database existence check
            if UnidadMedida.objects.filter(descripcion__iexact=val_clean).exists():
                errors.append(f"Fila {row_idx}: La unidad '{val_clean}' ya existe en la base de datos.")
                continue
            
            try:
                # 3. Create only
                um = UnidadMedida(
                    descripcion=val_clean,
                    abreviatura=abrev,
                    estado=True,
                    usuario_creacion=user,
                    eliminado=False
                )
                um.save()
                count += 1
            except Exception as e:
                errors.append(f"Fila {row_idx}: Error - {str(e)}")
        return count, errors

    def _import_articulos(self, data, user):
        count = 0
        errors = []
        seen_codes = set()
        seen_descs = set() # Check duplicates by description if code is missing? Or prioritize Code? Let's check both if present.

        for i, row in enumerate(data):
            row_idx = i + 1
            codigo = self._clean_key(row, 'Codigo')
            desc = self._clean_key(row, 'Descripcion')
            
            if not desc: 
                errors.append(f"Fila {row_idx}: Falta descripción")
                continue

            desc_clean = desc.strip()
            
            # Intra-file Check
            if codigo:
                code_clean = codigo.strip()
                if code_clean.lower() in seen_codes:
                    errors.append(f"Fila {row_idx}: El código '{code_clean}' está repetido en el archivo.")
                    continue
                seen_codes.add(code_clean.lower())
                
                # DB Check
                if Articulo.objects.filter(codigo=code_clean).exists():
                     errors.append(f"Fila {row_idx}: El código '{code_clean}' ya existe en la base de datos.")
                     continue
            else:
                # If no code, check description duplicates?
                if desc_clean.lower() in seen_descs:
                    errors.append(f"Fila {row_idx}: La descripción '{desc_clean}' está repetida en el archivo.")
                    continue
                seen_descs.add(desc_clean.lower())
                
                # DB Check
                if Articulo.objects.filter(descripcion__iexact=desc_clean).exists():
                    errors.append(f"Fila {row_idx}: El artículo '{desc_clean}' ya existe en la base de datos.")
                    continue
            
            # FK Lookups with Validation
            um_gen_str = self._clean_key(row, 'UM General')
            um_gen = None
            if um_gen_str:
                um_gen = UnidadMedida.objects.filter(descripcion__iexact=um_gen_str.strip()).first()
                if not um_gen:
                    errors.append(f"Fila {row_idx}: Unidad de Medida General '{um_gen_str}' no existe. Crear primero en Maestras.")
                    continue

            # UM Intermedia
            um_int_str = self._clean_key(row, 'UM Intermedia')
            um_int = None
            if um_int_str:
                um_int = UnidadMedida.objects.filter(descripcion__iexact=um_int_str.strip()).first()
                if not um_int:
                    errors.append(f"Fila {row_idx}: Unidad de Medida Intermedia '{um_int_str}' no existe. Crear primero en Maestras.")
                    continue

            # UM Especial
            um_esp_str = self._clean_key(row, 'UM Especial')
            um_esp = None
            if um_esp_str:
                um_esp = UnidadMedida.objects.filter(descripcion__iexact=um_esp_str.strip()).first()
                if not um_esp:
                    errors.append(f"Fila {row_idx}: Unidad de Medida Especial '{um_esp_str}' no existe. Crear primero en Maestras.")
                    continue
            
            cat_str = self._clean_key(row, 'Categoria')
            cat = None
            if cat_str:
                cat = Categoria.objects.filter(descripcion__iexact=cat_str.strip()).first()
                if not cat:
                    errors.append(f"Fila {row_idx}: Categoría '{cat_str}' no existe. Crear primero en Maestras.")
                    continue
            
            try:
                # Create Only
                art = Articulo(
                    codigo=codigo.strip() if codigo else None,
                    descripcion=desc_clean,
                    unidad_medida_general=um_gen,
                    unidad_medida_intermedia=um_int,
                    unidad_medida_especial=um_esp,
                    categoria=cat,
                    estado=True,
                    eliminado=False,
                    usuario_creacion=user
                )
                art.save()
                count += 1
            except Exception as e:
                errors.append(f"Fila {row_idx}: Error - {str(e)}")
                
        return count, errors
        
    def _import_vehiculos(self, data, user):
        count = 0
        errors = []
        seen_placas = set()
        
        for i, row in enumerate(data):
            row_idx = i + 1
            placa = self._clean_key(row, 'Placa')
            if not placa: 
                errors.append(f"Fila {row_idx}: Falta Placa")
                continue
            
            placa_clean = placa.strip().upper()
            
            # 1. Intra-file
            if placa_clean in seen_placas:
                errors.append(f"Fila {row_idx}: La placa '{placa_clean}' está repetida en el archivo.")
                continue
            seen_placas.add(placa_clean)

            # 2. DB Check
            if Vehiculo.objects.filter(placa=placa_clean).exists():
                errors.append(f"Fila {row_idx}: La placa '{placa_clean}' ya existe en la base de datos.")
                continue
            
            prop = self._clean_key(row, 'Propietario') or 'S/D'
            mod = self._clean_key(row, 'Modelo') or 'S/D'
            
            # Validar Tipo Vehiculo
            tipo_str = self._clean_key(row, 'Tipo Vehiculo')
            tipo = None
            if tipo_str:
                tipo = TipoVehiculo.objects.filter(descripcion__iexact=tipo_str.strip()).first()
                if not tipo:
                    errors.append(f"Fila {row_idx}: Tipo de Vehículo '{tipo_str}' no existe. Crear primero en Maestras.")
                    continue
            else:
                errors.append(f"Fila {row_idx}: Tipo de Vehículo es requerido.")
                continue

            try:
                # 3. Create Only
                veh = Vehiculo(
                    placa=placa_clean,
                    propietario=prop,
                    modelo=mod,
                    tipo_vehiculo=tipo,
                    disponible=True,
                    eliminado=False,
                    usuario_creacion=user
                )
                veh.save()
                count += 1
            except Exception as e:
                errors.append(f"Fila {row_idx}: Error - {str(e)}")

        return count, errors

    def _import_conductores(self, data, user):
        count = 0
        errors = []
        seen_cedulas = set()
        
        for i, row in enumerate(data):
            row_idx = i + 1
            cedula = self._clean_key(row, 'Cedula')
            if not cedula: 
                errors.append(f"Fila {row_idx}: Falta Cédula")
                continue
            
            cedula_clean = str(cedula).strip()

            # 1. Intra-file check
            if cedula_clean in seen_cedulas:
                errors.append(f"Fila {row_idx}: La cédula '{cedula_clean}' está repetida en el archivo.")
                continue
            seen_cedulas.add(cedula_clean)

            # 2. DB Check
            if Conductor.objects.filter(cedula=cedula_clean).exists():
                errors.append(f"Fila {row_idx}: La cédula '{cedula_clean}' ya existe en la base de datos.")
                continue
            
            nombre = self._clean_key(row, 'Nombre') or 'S/D'
            cel = self._clean_key(row, 'Celular') or ''
            
            lic_str = self._clean_key(row, 'Licencia')
            licencias = [l.strip() for l in lic_str.split(',')] if lic_str else []
            
            try:
                # 3. Create only
                cond = Conductor(
                    cedula=cedula_clean,
                    nombre=nombre,
                    celular=str(cel),
                    licencia=licencias,
                    activo=True,
                    eliminado=False,
                    usuario_creacion=user
                )
                cond.save()
                count += 1
            except Exception as e:
                errors.append(f"Fila {row_idx}: Error - {str(e)}")
        return count, errors

    def _import_clientes(self, data, user):
        count = 0
        errors = []
        seen_names = set()

        for i, row in enumerate(data):
            row_idx = i + 1
            nombre = self._clean_key(row, 'Nombre')
            if not nombre: 
                errors.append(f"Fila {row_idx}: Falta Nombre")
                continue
            
            nombre_clean = nombre.strip()
            nombre_lower = nombre_clean.lower()

            # 1. Intra-file check
            if nombre_lower in seen_names:
                errors.append(f"Fila {row_idx}: El cliente '{nombre_clean}' está repetido en el archivo.")
                continue
            seen_names.add(nombre_lower)

            # 2. DB Check
            if Cliente.objects.filter(nombre__iexact=nombre_clean).exists():
                 errors.append(f"Fila {row_idx}: El cliente '{nombre_clean}' ya existe en la base de datos.")
                 continue
            
            try:
                # 3. Create only
                cli = Cliente(
                    nombre=nombre_clean,
                    estado=True,
                    eliminado=False,
                    usuario_creacion=user
                )
                cli.save()
                count += 1
            except Exception as e:
                errors.append(f"Fila {row_idx}: Error - {str(e)}")
        return count, errors
