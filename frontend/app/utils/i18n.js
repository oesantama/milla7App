/**
 * i18n - Internacionalización básica
 * Sistema simple de traducciones
 */

const translations = {
  es: {
    // Common
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.create': 'Crear',
    'common.search': 'Buscar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    
    // Auth
    'auth.login': 'Iniciar Sesión',
    'auth.logout': 'Cerrar Sesión',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    
    // Dashboard
    'dashboard.title': 'Panel de Control',
    'dashboard.welcome': 'Bienvenido',
    
    // Operations
    'operations.title': 'Operaciones',
    'operations.create': 'Crear Operación',
    'operations.status.pending': 'Pendiente',
    'operations.status.in_progress': 'En Proceso',
    'operations.status.completed': 'Completada',
  },
  en: {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    
    // Operations
    'operations.title': 'Operations',
    'operations.create': 'Create Operation',
    'operations.status.pending': 'Pending',
    'operations.status.in_progress': 'In Progress',
    'operations.status.completed': 'Completed',
  },
};

// Get current language from localStorage or default
export const getCurrentLanguage = () => {
  if (typeof window === 'undefined') return 'es';
  return localStorage.getItem('language') || 'es';
};

// Set language
export const setLanguage = (lang) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('language', lang);
  window.location.reload();
};

// Translate function
export const t = (key, lang = getCurrentLanguage()) => {
  return translations[lang]?.[key] || key;
};

// Hook for translations
export function useTranslation() {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  const translate = (key) => t(key, currentLang);

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    setCurrentLang(newLang);
  };

  return {
    t: translate,
    language: currentLang,
    setLanguage: changeLanguage,
  };
}

/*
Para i18n completo, usar next-intl o react-i18next:

npm install next-intl

Ejemplo con next-intl:
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('common');
  return <button>{t('save')}</button>;
}
*/

export default translations;
