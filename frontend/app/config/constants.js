/**
 * Configuración de entorno y constantes globales
 */

// API URLs
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

// Analytics
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';

// Maps
export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

// Features flags
export const FEATURES = {
  ENABLE_2FA: process.env.NEXT_PUBLIC_ENABLE_2FA === 'true',
  ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA !== 'false',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_CHAT: process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true',
  ENABLE_MAPS: process.env.NEXT_PUBLIC_ENABLE_MAPS === 'true',
};

// Límites
export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  PAGE_SIZE: 10,
  SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutos
};

// Tipos de archivo permitidos
export const ALLOWED_FILE_TYPES = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.xlsx',
  '.xls',
  '.docx',
  '.doc',
];

// Estados de operación
export const OPERATION_STATUS = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Proceso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

// Colores por estado
export const STATUS_COLORS = {
  Pendiente: '#FFA726',
  'En Proceso': '#42A5F5',
  Completada: '#66BB6A',
  Cancelada: '#EF5350',
};

// Rutas
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/desktop',
  OPERATIONS: '/operaciones',
  CLIENTS: '/clientes',
  USERS: '/usuarios',
  VEHICLES: '/vehiculos',
  REPORTS: '/reportes',
  SETTINGS: '/configuracion',
  PROFILE: '/perfil',
  CHAT: '/chat',
  MAP: '/mapa',
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
};

// Mensajes por defecto
export const MESSAGES = {
  ERROR_GENERIC: 'Ha ocurrido un error. Por favor intenta de nuevo.',
  ERROR_NETWORK: 'Error de conexión. Verifica tu internet.',
  ERROR_UNAUTHORIZED: 'No tienes permisos para esta acción.',
  ERROR_NOT_FOUND: 'Recurso no encontrado.',
  SUCCESS_SAVE: 'Guardado exitosamente.',
  SUCCESS_DELETE: 'Eliminado exitosamente.',
  SUCCESS_UPDATE: 'Actualizado exitosamente.',
};

// Validación
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 100,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
};

// Timeouts
export const TIMEOUTS = {
  TOAST_DURATION: 3000,
  API_TIMEOUT: 30000,
  DEBOUNCE_SEARCH: 300,
};

// Breakpoints responsive
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export default {
  API_BASE_URL,
  WS_BASE_URL,
  FEATURES,
  LIMITS,
  ALLOWED_FILE_TYPES,
  OPERATION_STATUS,
  STATUS_COLORS,
  ROUTES,
  PAGINATION,
  MESSAGES,
  VALIDATION,
  TIMEOUTS,
  BREAKPOINTS,
};
