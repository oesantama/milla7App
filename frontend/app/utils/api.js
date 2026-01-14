// ruta: frontend/app/utils/api.js
import axios from 'axios';

// Detectar el entorno y configurar la baseURL apropiada
const getBaseURL = () => {
  // En producción (dentro de Docker con Nginx)
  if (typeof window !== 'undefined' && window.location.port === '8036') {
    return 'http://localhost:8036';
  }
  // En desarrollo local (Next.js dev server)
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return 'http://localhost:3000';
  }
  // Por defecto (SSR o fallback)
  return '';
};

// Crear instancia de axios configurada
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 segundos máximo
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de solicitudes
api.interceptors.request.use(
  (config) => {
    // Agregar token de autorización si existe
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo detallado de errores
    if (error.code === 'ECONNABORTED') {
      // Timeout
      error.userMessage = 'El servidor tardó demasiado en responder. Por favor, intenta de nuevo.';
    } else if (!error.response) {
      // Error de red (backend caído, sin internet, etc.)
      error.userMessage = 'Error de conexión. Verifica tu conexión a internet o que el servidor esté activo.';
    } else {
      // Errores HTTP
      switch (error.response.status) {
        case 400:
          error.userMessage = 'Los datos enviados son incorrectos.';
          break;
        case 401:
          error.userMessage = 'Usuario o contraseña incorrectos.';
          break;
        case 403:
          error.userMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          error.userMessage = 'Recurso no encontrado.';
          break;
        case 500:
          error.userMessage = 'Error interno del servidor. Contacta al administrador.';
          break;
        case 502:
        case 503:
          error.userMessage = 'El servidor no está disponible temporalmente.';
          break;
        default:
          error.userMessage = 'Ha ocurrido un error inesperado.';
      }
    }
    
    console.error('API Error:', {
      message: error.message,
      userMessage: error.userMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    return Promise.reject(error);
  }
);

export default api;
