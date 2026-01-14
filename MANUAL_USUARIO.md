# Manual de Usuario - Sistema de Logística Milla 7

## Introducción
Bienvenido al **Sistema de Logística Milla 7**. Esta plataforma ha sido diseñada para gestionar y optimizar las operaciones logísticas, permitiendo la administración de datos maestros, la gestión de pedidos, despachos y el seguimiento de planes de entrega.

## Acceso al Sistema
Para ingresar al sistema, diríjase a la dirección web proporcionada por el administrador.
1. Ingrese su **Usuario** y **Contraseña** en la pantalla de inicio de sesión.
2. Haga clic en el botón **"Ingresar"**.

> **Nota:** Si olvida su contraseña, contacte al administrador del sistema.

## Interfaz Principal (Dashboard)
Al iniciar sesión, accederá al **Dashboard** o panel principal. Aquí encontrará:
- Un resumen visual de las operaciones.
- Gráficas de rendimiento (ej. Ventas, Estadísticas).
- Menú de navegación lateral para acceder a los diferentes módulos.

## Módulos del Sistema

### 1. Módulo de Maestras
Este módulo permite la configuración y administración de la información base del sistema. Es fundamental mantener estos datos actualizados para el correcto funcionamiento de las operaciones.

Sub-módulos disponibles:
- **Artículos:** Gestión del catálogo de productos.
- **Categorías:** Clasificación de artículos.
- **Clientes:** Base de datos de clientes y sus sedes.
- **Conductores:** Información de los conductores autorizados.
- **Vehículos:** Flota de vehículos disponibles.
- **Tipos de Vehículos:** Clasificación de la flota.
- **Unidades de Medida:** Definición de unidades (kg, m3, und, etc.).
- **Usuarios, Roles y Permisos:** Administración del acceso al sistema.
- **Correos y Tipos de Notificación:** Configuración de alertas automáticas.

### 2. Módulo de Operaciones
Este es el núcleo transaccional del sistema. Aquí se gestionan los procesos diarios de logística.

Funcionalidades clave:
- **Carga de Archivos:**
  - **Plan Normal:** Carga masiva de solicitudes de transporte estándar.
  - **Plan R:** Carga de solicitudes de reabastecimiento o rutas especiales.
  - El sistema validará el formato de los archivos (Excel/CSV) antes de procesarlos.
  
- **Consultas y Reportes:**
  - **Planes de Entrega:** Visualización unificada de los planes cargados.
  - **Historial de Cargas:** Registro de todas las importaciones de archivos realizadas.
  - **Estadísticas:** Métricas sobre el cumplimiento y volumen de operaciones.
  
- **Gestión de Pedidos y Despachos:**
  - Seguimiento detallado de cada pedido.
  - Asignación de vehículos y conductores a los despachos.
  - Generación de documentos de despacho.

## Preguntas Frecuentes

**¿Qué hago si falla la carga de un archivo?**
Verifique que el archivo Excel no tenga celdas combinadas, que las fechas tengan el formato correcto y que no falten datos obligatorios. El sistema mostrará un mensaje de error indicando la fila o columna problemática.

**¿Cómo creo un nuevo usuario?**
Diríjase a `Maestras > Usuarios`. Haga clic en "Nuevo Usuario", complete los datos requeridos y asigne un Rol (ej. Administrador, Operador).

---
**Soporte Técnico:** Para reportar errores o solicitar ayuda adicional, contacte al equipo de TI.
