/**
 * Sistema de permisos y roles
 * Helpers para verificar permisos del usuario
 */

// Roles disponibles
export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
};

// Jerarquía de roles (de mayor a menor)
const ROLE_HIERARCHY = [
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
  ROLES.OPERATOR,
  ROLES.VIEWER,
];

// Permisos por módulo
export const PERMISSIONS = {
  // Usuarios
  'users.view': [ROLES.ADMIN, ROLES.SUPERVISOR],
  'users.create': [ROLES.ADMIN],
  'users.edit': [ROLES.ADMIN],
  'users.delete': [ROLES.ADMIN],
  
  // Operaciones
  'operations.view': Object.values(ROLES),
  'operations.create': [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.OPERATOR],
  'operations.edit': [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.OPERATOR],
  'operations.delete': [ROLES.ADMIN, ROLES.SUPERVISOR],
  
  // Clientes
  'clients.view': Object.values(ROLES),
  'clients.create': [ROLES.ADMIN, ROLES.SUPERVISOR],
  'clients.edit': [ROLES.ADMIN, ROLES.SUPERVISOR],
  'clients.delete': [ROLES.ADMIN],
  
  // Reportes
  'reports.view': [ROLES.ADMIN, ROLES.SUPERVISOR],
  'reports.create': [ROLES.ADMIN, ROLES.SUPERVISOR],
  'reports.export': [ROLES.ADMIN, ROLES.SUPERVISOR],
  
  // Configuración
  'settings.view': [ROLES.ADMIN],
  'settings.edit': [ROLES.ADMIN],
};

// Verificar si usuario tiene permiso
export const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles?.includes(userRole) || false;
};

// Verificar si usuario tiene rol mínimo
export const hasMinimumRole = (userRole, minimumRole) => {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const minIndex = ROLE_HIERARCHY.indexOf(minimumRole);
  return userIndex !== -1 && userIndex <= minIndex;
};

// Verificar múltiples permisos (AND)
export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// Verificar múltiples permisos (OR)
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

// Hook para usar permisos
export function usePermissions(user) {
  const can = (permission) => {
    return hasPermission(user?.role, permission);
  };

  const canAny = (...permissions) => {
    return hasAnyPermission(user?.role, permissions);
  };

  const canAll = (...permissions) => {
    return hasAllPermissions(user?.role, permissions);
  };

  const isRole = (role) => {
    return user?.role === role;
  };

  const isMinRole = (minimumRole) => {
    return hasMinimumRole(user?.role, minimumRole);
  };

  return {
    can,
    canAny,
    canAll,
    isRole,
    isMinRole,
    role: user?.role,
  };
}

// Componente para renderizar basado en permiso
export function Can({ permission, children, fallback = null }) {
  const user = getUserFromContext(); // Implementar según tu contexto
  
  if (hasPermission(user?.role, permission)) {
    return children;
  }
  
  return fallback;
}

// Helper para obtener usuario del contexto
function getUserFromContext() {
  // TODO: Implementar con useContext(AuthContext)
  return { role: ROLES.ADMIN }; // Mock
}

// Ejemplo de uso:
/*
const { can, isRole } = usePermissions(user);

if (can('users.delete')) {
  // Mostrar botón eliminar
}

<Can permission="users.create">
  <button>Crear Usuario</button>
</Can>
*/
