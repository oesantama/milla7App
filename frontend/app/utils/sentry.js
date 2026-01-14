/**
 * Sentry Error Tracking Setup
 * Monitoreo de errores en producción
 */

// Nota: Instalar con: npm install @sentry/nextjs
// Este es el código de configuración, requiere instalación

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Configuración de ejemplo
    const config = {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      
      // Enriquecer con contexto de usuario
      beforeSend(event, hint) {
        const user = getUserFromSession();
        if (user) {
          event.user = {
            id: user.id,
            username: user.username,
            email: user.email,
          };
        }
        return event;
      },

      // Filtrar errores conocidos
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
    };

    console.log('Sentry configuration ready:', config);
    // Sentry.init(config); // Descomentar cuando se instale
  }
};

const getUserFromSession = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Decodificar token JWT si es necesario
      return { id: 'current_user', username: 'user' };
    }
  } catch (error) {
    console.error('Error getting user:', error);
  }
  
  return null;
};

// Capturar excepción manualmente
export const captureException = (error, context = {}) => {
  console.error('Error captured:', error, context);
  // Sentry.captureException(error, { extra: context });
};

// Capturar mensaje
export const captureMessage = (message, level = 'info') => {
  console.log(`[${level}]`, message);
  // Sentry.captureMessage(message, level);
};
