# Manual Técnico - Sistema de Logística Milla 7

## Introducción
Este documento detalla la arquitectura, instalación, mantenimiento y estructura de datos del sistema **Milla 7 App**.

## Arquitectura del Sistema
El proyecto utiliza **Docker** y **Docker Compose** para orquestar los siguientes servicios:

1.  **Frontend:** Next.js (React), Puerto 3000 (Host: 8036).
2.  **Backend:** Django REST Framework (Python), Puerto 8000 (Host: 3036).
3.  **Base de Datos:** PostgreSQL 15.
4.  **Proxy:** Nginx, Puerto 80.

## Diccionario de Datos Detallado
A continuación se presenta la estructura **completa** de la base de datos, detallando tablas, columnas y propiedades.

---

### 1. Módulo Core (`core`)
Modelos base para la gestión de flota y catálogo de productos.

#### Tabla: `Vehiculo`
Almacena la información de la flota de transporte.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `placa` | CharField(10) | Matrícula única | **Unique**, No Null |
| `propietario` | CharField(100) | Nombre del propietario | No Null |
| `cubicaje` | DecimalField(6,2) | Capacidad | Nullable |
| `modelo` | CharField(50) | Modelo/Año | No Null |
| `tipo_vehiculo` | ForeignKey | -> `core.TipoVehiculo` | Nullable, OnDelete: SET_NULL |
| `estado` | ForeignKey | -> `maestras.MasterEstado` | Nullable, OnDelete: SET_NULL |
| `eliminado` | BooleanField | Borrado lógico | Default: `False` |
| `fecha_creacion` | DateTimeField | Auditoría | AutoNowAdd |
| `fecha_modificacion` | DateTimeField | Auditoría | AutoNow |
| `usuario_creacion` | ForeignKey | -> `auth.User` | Nullable |
| `usuario_modificacion` | ForeignKey | -> `auth.User` | Nullable |

#### Tabla: `Conductor`
Registro del personal de conducción.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `cedula` | CharField(15) | Documento Identidad | **Unique**, No Null |
| `nombre` | CharField(100) | Nombre completo | No Null |
| `celular` | CharField(15) | Teléfono contacto | No Null |
| `licencia` | JSONField | Categorías de licencia | Default: `list` |
| `activo` | BooleanField | Estado operativo | Default: `True` |
| `eliminado` | BooleanField | Borrado lógico | Default: `False` |
| `fecha_creacion` | DateTimeField | Auditoría | AutoNowAdd |
| `fecha_modificacion` | DateTimeField | Auditoría | AutoNow |
| `usuario_creacion` | ForeignKey | -> `auth.User` | Nullable |
| `usuario_modificacion` | ForeignKey | -> `auth.User` | Nullable |

#### Tabla: `Cliente`
Empresas o clientes gestionados.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `nombre` | CharField(150) | Razón social | No Null |
| `logo` | ImageField | Archivo de imagen | Nullable |
| `estado` | BooleanField | Activo/Inactivo | Default: `True` |
| `eliminado` | BooleanField | Borrado lógico | Default: `False` |
| `fecha_creacion` | DateTimeField | Auditoría | AutoNowAdd |
| `fecha_modificacion` | DateTimeField | Auditoría | AutoNow |
| `usuario_creacion` | ForeignKey | -> `auth.User` | Nullable |
| `usuario_modificacion` | ForeignKey | -> `auth.User` | Nullable |

#### Tabla: `TipoVehiculo`
Clasificación de la flota.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `descripcion` | CharField(100) | Nombre del tipo | **Unique**, No Null |
| `estado` | BooleanField | Activo/Inactivo | Default: `True` |
| `eliminado` | BooleanField | Borrado lógico | Default: `False` |
| `fecha_creacion` | DateTimeField | Auditoría | AutoNowAdd |
| `fecha_modificacion` | DateTimeField | Auditoría | AutoNow |
| `usuario_creacion` | ForeignKey | -> `auth.User` | Nullable |
| `usuario_modificacion` | ForeignKey | -> `auth.User` | Nullable |

#### Tabla: `Categoria`
Categorización de artículos.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `descripcion` | CharField(100) | Nombre categoría | **Unique**, No Null |
| `estado` | BooleanField | Activo/Inactivo | Default: `True` |
| `eliminado` | BooleanField | Borrado lógico | Default: `False` |
| `fecha_creacion` | DateTimeField | Auditoría | AutoNowAdd |
| `fecha_modificacion` | DateTimeField | Auditoría | AutoNow |
| `usuario_creacion` | ForeignKey | -> `auth.User` | Nullable |
| `usuario_modificacion` | ForeignKey | -> `auth.User` | Nullable |

#### Tabla: `UnidadMedida`
Unidades (kg, m3, und, etc).

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `descripcion` | CharField(100) | Nombre unidad | **Unique**, No Null |
| `abreviatura` | CharField(10) | Símbolo corto | Nullable |
| `estado` | BooleanField | Activo/Inactivo | Default: `True` |
| `eliminado` | BooleanField | Borrado lógico | Default: `False` |
| `fecha_creacion` | DateTimeField | Auditoría | AutoNowAdd |
| `fecha_modificacion` | DateTimeField | Auditoría | AutoNow |
| `usuario_creacion` | ForeignKey | -> `auth.User` | Nullable |
| `usuario_modificacion` | ForeignKey | -> `auth.User` | Nullable |

#### Tabla: `Articulo`
Maestro de SKUs/Productos.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `codigo` | CharField(50) | SKU/Referencia | Nullable |
| `descripcion` | CharField(100) | Nombre producto | No Null |
| `unidad_medida_general` | ForeignKey | -> `core.UnidadMedida` | Nullable |
| `unidad_medida_especial`| ForeignKey | -> `core.UnidadMedida` | Nullable |
| `unidad_medida_intermedia`| ForeignKey| -> `core.UnidadMedida` | Nullable |
| `factor_general` | FloatField | Conversión base | Default: `1.0` |
| `factor_intermedio` | FloatField | Conversión media | Default: `1.0` |
| `factor_especial` | FloatField | Conversión especial | Default: `1.0` |
| `categoria` | ForeignKey | -> `core.Categoria` | Nullable |
| `estado` | BooleanField | Activo/Inactivo | Default: `True` |
| `eliminado` | BooleanField | Borrado lógico | Default: `False` |
| `fecha_creacion` | DateTimeField | Auditoría | AutoNowAdd |
| `fecha_modificacion` | DateTimeField | Auditoría | AutoNow |
| `usuario_creacion` | ForeignKey | -> `auth.User` | Nullable |
| `usuario_modificacion` | ForeignKey | -> `auth.User` | Nullable |

---

### 2. Módulo Maestras (`maestras`)
Configuración del sistema.

#### Tabla: `Modulo`
Agrupación principal del menú.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `descripcion_modulo` | CharField(100) | Nombre módulo | **Unique**, No Null |
| `order` | IntegerField | Orden visual | Default: `0` |
| `es_expansivo` | BooleanField | UI Behavior | Default: `True` |
| `route` | CharField(255) | Ruta base | Nullable |
| `estado` | BooleanField | Activo/Inactivo | Default: `True` |
| `fecha_creacion` | DateTimeField | Auditoría | AutoNowAdd |
| `fecha_modificacion` | DateTimeField | Auditoría | AutoNow |
| `usuario_creacion` | ForeignKey | -> `auth.User` | Nullable |

#### Tabla: `Pagina`
Sub-menú de Módulo.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `modulo` | ForeignKey | -> `maestras.Modulo` | No Null, Cascade |
| `descripcion_pages` | CharField(100) | Nombre página | No Null |
| `order` | IntegerField | Orden visual | Default: `0` |
| `icono` | CharField(100) | Clase icono CSS | Nullable |
| `route` | CharField(255) | Ruta URL | Nullable |
| `estado` | BooleanField | Activo/Inactivo | Default: `True` |
| `fecha_creacion` | DateTimeField | Auditoría | AutoNowAdd |

#### Tabla: `Tab`
Pestañas internas de Pagina.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id_tab` | AutoField | PK | Autoincremental |
| `pagina` | ForeignKey | -> `maestras.Pagina` | No Null, Cascade |
| `descripcion_tabs` | CharField(100) | Nombre Tab | No Null |
| `icono` | CharField(100) | Clase icono CSS | Nullable |
| `route` | CharField(255) | Ruta URL | Nullable |
| `estado` | BooleanField | Activo/Inactivo | Default: `True` |
| `fecha_creacion` | DateTimeField | Auditoría | AutoNowAdd |

#### Tabla: `Rol`
Roles de usuario.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id_rol` | AutoField | PK | Autoincremental |
| `descripcion_rol` | CharField(100) | Nombre Rol | **Unique**, No Null |
| `estado` | BooleanField | Activo/Inactivo | Default: `True` |
| `fecha_creacion` | DateTimeField | Auditoría | AutoNowAdd |

#### Tabla: `PermisoPorRol`
Matriz ACL Rol-Tab.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `rol` | ForeignKey | -> `maestras.Rol` | No Null |
| `tab` | ForeignKey | -> `maestras.Tab` | No Null |
| `ver` | BooleanField | Permiso lectura | Default: `False` |
| `crear` | BooleanField | Permiso escritura | Default: `False` |
| `editar` | BooleanField | Permiso edición | Default: `False` |
| `borrar` | BooleanField | Permiso borrado | Default: `False` |

#### Tabla: `PermisoPorUsuario`
Permisos excepcionales por usuario.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `usuario` | ForeignKey | -> `auth.User` | No Null |
| `tab` | ForeignKey | -> `maestras.Tab` | No Null |
| `cliente` | ForeignKey | -> `core.Cliente` | Nullable |
| `ver` | BooleanField | Permiso lectura | Default: `False` |
| `crear` | BooleanField | Permiso escritura | Default: `False` |
| `editar` | BooleanField | Permiso edición | Default: `False` |
| `borrar` | BooleanField | Permiso borrado | Default: `False` |

#### Tabla: `MasterEstado`
Estados globales del flujo de trabajo.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `descripcion` | CharField(50) | Nombre Estado | **Unique**, No Null |
| `estado` | BooleanField | Activo/Inactivo | Default: `True` |
| `fecha_creacion` | DateTimeField | Auditoría | AutoNowAdd |

#### Tabla: `TipoNotificacion`
Tipos de alertas.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `nombre` | CharField(100) | Nombre Tipo | **Unique**, No Null |
| `descripcion` | CharField(255) | Detalle | Nullable |
| `estado` | BooleanField | Activo/Inactivo | Default: `True` |

---

### 3. Módulo Logística (`logistics`)
Operativa transaccional.

#### Tabla: `EncSolicitud`
Encabezado de Pedidos/Solicitudes.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `un_orig` | CharField(255) | UN Origen | Nullable |
| `f_demanda` | DateField | Fecha Demanda | Nullable |
| `n_ped` | CharField(255) | Nro Pedido | Nullable |
| `placa` | CharField(50) | Placa | Nullable |
| `carga` | CharField(255) | Info Carga | Nullable |
| `direccion_1` | CharField(255) | Dirección | Nullable |
| `observaciones` | TextField | Obs | Nullable |
| `plan_type` | CharField(20) | PLAN_NORMAL / PLAN_R | Default: `PLAN_NORMAL` |
| `estado` | ForeignKey | -> `maestras.MasterEstado` | Nullable |
| `fecha_carge` | DateTimeField | Fecha Importación | AutoNowAdd |
| `usuario_carge` | CharField(255) | Usuario Importó | Nullable |
| `message` | TextField | Mensaje Log | Nullable |
| `fecha_control` | DateTimeField | Control | AutoNowAdd |
| `usuario_control` | CharField(255) | Control | Nullable |

#### Tabla: `DetalleSolicitud`
Items de la solicitud.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `encabezado` | ForeignKey | -> `logistics.EncSolicitud` | No Null, Cascade |
| `articulo` | CharField(255) | Nombre Articulo | Nullable |
| `cant_env` | IntegerField | Cantidad | Nullable |
| `volumen` | FloatField | Volumen Unit | Nullable |
| `total_volume` | FloatField | Volumen Total | Nullable |
| `um` | CharField(50) | Unidad Medida | Nullable |
| `remision_transferencia`| CharField(255) | Remisión | Nullable |
| `n_ped` | CharField(255) | Pedido | Nullable |

#### Tabla: `Recepcion`
Control de Recepción.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `encabezado` | ForeignKey | -> `logistics.EncSolicitud` | No Null, Cascade |
| `fecha_inicio` | DateTimeField | Fecha Inicio | AutoNowAdd |
| `fecha_fin` | DateTimeField | Fecha Fin | Nullable |
| `estado` | ForeignKey | -> `maestras.MasterEstado` | Nullable |
| `usuario` | CharField(255) | Usuario Responsable | Nullable |
| `intentos_fallidos` | IntegerField | Contador Fallos | Default: `0` |

#### Tabla: `DetalleRecepcion`
Items en recepción.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `recepcion` | ForeignKey | -> `logistics.Recepcion` | No Null, Cascade |
| `articulo` | ForeignKey | -> `core.Articulo` | Nullable |
| `cantidad_contada_base`| FloatField | Conteo Físico | Default: `0.0` |
| `novedad` | BooleanField | Tiene Novedad | Default: `False` |

#### Tabla: `CorreosNotificacion`
Suscripciones a alertas.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `correo` | EmailField | Email Destino | No Null |
| `nombre_contacto` | CharField(255) | Nombre | Nullable |
| `tipo_novedad` | ForeignKey | -> `maestras.TipoNotificacion`| Nullable |
| `estado` | ForeignKey | -> `maestras.MasterEstado` | Nullable |
| `usuario_registro` | CharField(255) | Auditoría | Nullable |
| `fecha_registro` | DateTimeField | Auditoría | AutoNowAdd |

#### Tabla: `Despacho`
Planilla de salida.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `vehiculo` | ForeignKey | -> `core.Vehiculo` | Nullable |
| `conductor` | ForeignKey | -> `core.Conductor` | Nullable |
| `fecha_despacho` | DateField | Fecha Salida | AutoNowAdd |
| `estado` | ForeignKey | -> `maestras.MasterEstado` | Nullable |
| `capacidad_ocupada` | FloatField | % Ocupación | Default: `0.0` |
| `usuario_creacion` | CharField(255) | Auditoría | Nullable |
| `fecha_creacion` | DateTimeField | Auditoría | AutoNowAdd |

#### Tabla: `DetalleDespacho`
Pedidos en despacho.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `despacho` | ForeignKey | -> `logistics.Despacho` | No Null, Cascade |
| `pedido_n` | CharField(255) | Ref Pedido | Nullable |
| `direccion` | CharField(255) | Dirección | Nullable |
| `volumen_total` | FloatField | Volumen | Default: `0.0` |
| `peso_total` | FloatField | Peso | Default: `0.0` |

---

### 4. Módulo Operaciones (`operations`)
Datos masivos.

#### Tabla: `DeliveryPlan`
Planes de entrega unificados.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `plan_type` | CharField(20) | Tipo Plan | No Null |
| `wh_id` | CharField(50) | Warehouse ID | Nullable |
| `un` | CharField(50) | UN | Nullable |
| `cliente_code` | CharField(50) | Código Cliente | Nullable |
| `sec_dir` | CharField(50) | Sec Dir | Nullable |
| `nombre` | CharField(200) | Nombre | Nullable |
| `dir_1` | CharField(300) | Dir 1 | Nullable |
| `dir_2` | CharField(300) | Dir 2 | Nullable |
| `latitud` | DecimalField(10,7)| GPS Lat | Nullable |
| `longitud` | DecimalField(10,7)| GPS Lon | Nullable |
| `empresa` | CharField(200) | Empresa | Nullable |
| `conductor` | CharField(200) | Conductor | Nullable |
| `placa` | CharField(20) | Placa | Nullable |
| `carga` | DecimalField(10,4)| Carga | Nullable |
| `extra_field_1..5` | CharField/Text | Campos Extra | Nullable |
| `file_source` | CharField(255) | Archivo Origen | No Null |
| `uploaded_by` | ForeignKey | -> `auth.User` | Nullable |
| `created_at` | DateTimeField | Fecha Carga | AutoNowAdd |
| `updated_at` | DateTimeField | Fecha Act | AutoNow |

#### Tabla: `FileUploadLog`
Log de importaciones.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `filename` | CharField(255) | Nombre Archivo | No Null |
| `file_type` | CharField(10) | XLS, CSV... | No Null |
| `plan_type` | CharField(20) | Tipo Plan | No Null |
| `total_rows` | IntegerField | Total Filas | Default: `0` |
| `records_processed` | IntegerField | Procesados | Default: `0` |
| `records_success` | IntegerField | Exitosos | Default: `0` |
| `records_failed` | IntegerField | Fallidos | Default: `0` |
| `error_log` | JSONField | Log Errores | Nullable |
| `processing_time` | FloatField | Tiempo (s) | Nullable |
| `uploaded_by` | ForeignKey | -> `auth.User` | Nullable |
| `uploaded_at` | DateTimeField | Fecha | AutoNowAdd |
| `status` | CharField(20) | SUCCESS/FAIL | Default: `SUCCESS` |

---

### 5. Módulo Usuarios (`users`)

#### Tabla: `UserProfile`
Perfil extendido.

| Columna | Tipo de Dato | Relación / Descripción | Propiedades |
| :--- | :--- | :--- | :--- |
| `id` | AutoField | PK | Autoincremental |
| `user` | OneToOneField | -> `auth.User` | No Null, Cascade |
| `role` | ForeignKey | -> `maestras.Rol` | Nullable |
| `phone_number` | CharField(20) | Teléfono | Nullable |
| `clientes` | ManyToMany | -> `core.Cliente` | N/A (Tabla interm.) |
| `eliminado` | BooleanField | Borrado lógico | Default: `False` |
