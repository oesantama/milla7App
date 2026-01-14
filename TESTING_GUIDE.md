# Guía de Pruebas: Milla 7 App

Este documento proporciona los pasos completos para probar la aplicación Milla 7 con el usuario de pruebas (`testuser` / `testpassword`).

## 📋 Requisitos Previos

- Python 3.8+
- Node.js 16+
- PostgreSQL o SQLite configurado
- Las dependencias instaladas (backend y frontend)

## 🚀 Pasos de Ejecución

### 1. Preparar el Backend

#### 1.1 Crear el usuario de pruebas

Ejecuta el comando de Django que crea el usuario `testuser` con permisos completos:

```powershell
cd 'c:\Users\Admin\Documents\oscar\sistematizacionMilla7\milla7App\backend'
python manage.py create_testuser
```

**Salida esperada:**

```
✓ Created user: testuser
✓ Created UserProfile for testuser
→ Setting up Maestras data...
✓ Maestras data ready
→ Setting up operations...
✓ Operations ready
→ Assigning permissions...
✓ Created X new permissions

✅ Test user setup complete!

   Username: testuser
   Password: testpassword
   Role: admin
   Permissions: Full access to all modules and operations
```

#### 1.2 Ejecutar Tests del Backend

Verifica que el endpoint de permisos funciona correctamente:

```powershell
cd 'c:\Users\Admin\Documents\oscar\sistematizacionMilla7\milla7App\backend'
python manage.py test users.tests.test_permissions
```

**Salida esperada:**

```
Found 1 test(s).
test_permissions_endpoint_returns_structure (users.tests.test_permissions.PermissionsEndpointTest) ... ok

Ran 1 test in 0.XXs

OK
```

#### 1.3 Iniciar el Backend

Si aún no está corriendo:

```powershell
cd 'c:\Users\Admin\Documents\oscar\sistematizacionMilla7\milla7App\backend'
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

### 2. Preparar el Frontend

#### 2.1 Instalar Dependencias

```powershell
cd 'c:\Users\Admin\Documents\oscar\sistematizacionMilla7\milla7App\frontend'
npm install
```

#### 2.2 Ejecutar Tests del Frontend

Verifica que el componente de Layout renderiza correctamente:

```powershell
cd 'c:\Users\Admin\Documents\oscar\sistematizacionMilla7\milla7App\frontend'
npm test -- --no-coverage
```

**Salida esperada:**

```
PASS  __tests__/Layout.test.jsx
  Layout component
    ✓ renders menu items from permissions (XXms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

Para salir del modo watch: presiona `q`

#### 2.3 Iniciar el Frontend en Modo Desarrollo

```powershell
cd 'c:\Users\Admin\Documents\oscar\sistematizacionMilla7\milla7App\frontend'
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

### 3. Verificación en el Navegador

#### 3.1 Abre el navegador

Ve a: `http://localhost:3000`

#### 3.2 Inicia sesión

- **Usuario:** `testuser`
- **Contraseña:** `testpassword`

#### 3.3 Verifica que Todo Funciona

1. **Página de login:**

   - Debería cargar sin errores
   - Aceptar credenciales de testuser

2. **Redirección a Dashboard:**

   - Después de login exitoso, deberías ser redirigido a `/dashboard`
   - Deberías ver el mensaje "Bienvenido al Sistema"

3. **Menú Lateral:**

   - Deberías ver en la barra lateral izquierda:
     - "Milla 7" como título
     - "Dashboard General" como primer ítem
     - Selector de "Operaciones" (Ajover, Exito, Global)
     - Sección "Menú General" con:
       - **Maestras**
         - Gestión de Operaciones (gris si no tiene url_path)
       - **Usuarios**
         - Crear Usuario (enlace clickeable a `/users/create`)
         - Asignar Permisos (enlace clickeable a `/users/assign-permissions`)
       - **Inventario**
         - Gestión de Productos (gris si no tiene url_path)

4. **Consola del Navegador (DevTools - F12 → Console):**

   - NO deberías ver el error: "Application error: a client-side exception has occurred"
   - Deberías ver logs de debug como:
     ```
     Layout: permissions: Array(3) [ {...}, {...}, {...} ]
     Layout: operations: Array(3) [ {...}, {...}, {...} ]
     ```

5. **Pestaña Network (DevTools - F12 → Network):**

   - Busca la petición: `GET /api/users/1/permissions/`
   - Status: **200 OK**
   - Response: JSON con estructura:
     ```json
     {
       "modules": [ { "id": 1, "name": "Maestras", ... }, ... ],
       "operations": [ { "id": 1, "name": "Ajover", ... }, ... ]
     }
     ```

6. **Menú de Usuario (esquina superior derecha):**
   - Click en el botón con tu inicial
   - Deberías ver dropdown con:
     - Tu nombre de usuario
     - Tu rol (admin)
     - Opción "Mi Perfil"
     - Opción "Cerrar Sesión"

#### 3.4 Prueba de Cierre de Sesión

- Click en "Cerrar Sesión"
- Deberías ser redirigido a la página de login
- Los tokens deben ser eliminados del localStorage

## 📊 Resumen de Archivos Modificados/Creados

### Backend

- ✅ `backend/users/management/commands/create_testuser.py` (NUEVO) — Management command
- ✅ `backend/users/tests/test_permissions.py` — Test del endpoint
- ✅ `backend/users/views.py` — Endpoint de permisos (ya existente)
- ✅ `backend/users/models.py` — Modelos UserProfile/UserPermission

### Frontend

- ✅ `frontend/app/components/Layout.js` — Layout principal (refactorizado)
- ✅ `frontend/app/components/Menu.js` (NUEVO) — Componente de menú
- ✅ `frontend/app/components/MenuItem.js` (NUEVO) — Componente de ítem del menú
- ✅ `frontend/app/components/UserMenu.js` — Menú de usuario (mejorado)
- ✅ `frontend/app/context/AuthContext.js` — Context de autenticación (defensivo)
- ✅ `frontend/app/globals.css` — Estilos globales (mejorados)
- ✅ `frontend/jest.config.cjs` — Config de Jest
- ✅ `frontend/babel.config.json` — Config de Babel
- ✅ `frontend/__tests__/Layout.test.jsx` — Test del Layout

## 🔍 Solución de Problemas

### Problema: "Application error: a client-side exception has occurred"

**Solución:**

- Abre DevTools (F12)
- Ve a Console
- Busca el stack trace completo
- Pega el error aquí para que lo debuguee

### Problema: El menú no aparece

**Solución:**

- Verifica que el endpoint `/api/users/<id>/permissions/` devuelve 200 (Network tab)
- Asegúrate de que `permissions` no es null (Console logs)
- Recarga la página (Ctrl+F5) para limpiar caché

### Problema: Login no funciona

**Solución:**

- Verifica que el backend está corriendo en `http://localhost:8000`
- Confirma que `testuser` fue creado: `python manage.py createsuperuser --username=testuser` (o usa create_testuser)
- Revisa la pestaña Network → `POST /api/token/` debe devolver 200 con access_token

### Problema: Las pruebas de Jest fallan

**Solución:**

```powershell
cd frontend
rm -r node_modules package-lock.json
npm install
npm test
```

## 📝 Notas Finales

- El usuario `testuser` tiene acceso **completo** a todos los módulos, páginas, tabs y operaciones.
- La contraseña se puede cambiar en cualquier momento usando: `python manage.py changepassword testuser`
- Para eliminar el usuario: `python manage.py shell` → `User.objects.get(username='testuser').delete()`
- Los tests se pueden ejecutar en modo watch: `npm test` (sin --no-coverage)

## ✅ Checklist Final

- [ ] Backend corriendo en http://localhost:8000
- [ ] Frontend corriendo en http://localhost:3000
- [ ] Tests del backend pasan: `python manage.py test users`
- [ ] Tests del frontend pasan: `npm test`
- [ ] Login exitoso con testuser/testpassword
- [ ] Menú lateral visible con módulos y operaciones
- [ ] Sin errores en la consola del navegador
- [ ] Endpoint `/api/users/1/permissions/` devuelve 200 y estructura correcta
- [ ] Logout funciona y redirige a login

¡Listo! Tu aplicación está lista para pruebas. 🚀
