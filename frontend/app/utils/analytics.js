/**
 * Google Analytics 4 setup
 * Tracking de eventos y páginas
 */

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Página vista
export const pageview = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Eventos personalizados
export const event = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Eventos predefinidos
export const trackEvent = {
  // Login
  login: (method = 'credentials') => {
    event({
      action: 'login',
      category: 'engagement',
      label: method,
    });
  },

  // Operaciones
  createOperation: (clientId) => {
    event({
      action: 'create_operation',
      category: 'operations',
      label: `client_${clientId}`,
    });
  },

  // Exportación
  exportData: (format, rows) => {
    event({
      action: 'export_data',
      category: 'data',
      label: format,
      value: rows,
    });
  },

  // Búsqueda
  search: (term) => {
    event({
      action: 'search',
      category: 'engagement',
      label: term,
    });
  },

  // Filtros
  applyFilters: (filterCount) => {
    event({
      action: 'apply_filters',
      category: 'data',
      value: filterCount,
    });
  },
};
