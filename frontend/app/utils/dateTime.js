/**
 * Utilidades de fecha y tiempo
 */

// Formatear fecha a español
export const formatDate = (date, format = 'long') => {
  const d = new Date(date);
  
  const formats = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: '2-digit', month: 'short', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
  };
  
  return new Intl.DateTimeFormat('es-CO', formats[format]).format(d);
};

// Formatear hora
export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Formatear fecha y hora
export const formatDateTime = (date) => {
  return `${formatDate(date, 'medium')} ${formatTime(date)}`;
};

// Tiempo relativo (hace 5 minutos, hace 2 horas, etc.)
export const timeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  }
  const years = Math.floor(diffDays / 365);
  return `Hace ${years} año${years > 1 ? 's' : ''}`;
};

// Diferencia en días
export const daysDiff = (date1, date2 = new Date()) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Es hoy?
export const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

// Es esta semana?
export const isThisWeek = (date) => {
  const d = new Date(date);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  
  return d >= weekStart && d < weekEnd;
};

// Agregar días a una fecha
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Duración en formato legible
export const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

// Timestamp para nombres de archivo
export const getTimestamp = () => {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
};

// Rango de fechas
export const getDateRange = (type) => {
  const now = new Date();
  const ranges = {
    today: {
      from: new Date(now.setHours(0, 0, 0, 0)),
      to: new Date(now.setHours(23, 59, 59, 999)),
    },
    yesterday: {
      from: new Date(now.setDate(now.getDate() - 1)),
      to: new Date(now.setHours(23, 59, 59, 999)),
    },
    thisWeek: {
      from: new Date(now.setDate(now.getDate() - now.getDay())),
      to: new Date(),
    },
    thisMonth: {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(),
    },
    last30Days: {
      from: addDays(new Date(), -30),
      to: new Date(),
    },
  };
  
  return ranges[type] || ranges.today;
};
