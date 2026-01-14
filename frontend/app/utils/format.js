/**
 * Utilidades para formateo de números y moneda
 */

// Formatear moneda COP
export const formatCurrency = (amount, currency = 'COP') => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Formatear número con separadores
export const formatNumber = (number) => {
return new Intl.NumberFormat('es-CO').format(number);
};

// Formatear porcentaje
export const formatPercent = (value, decimals = 0) => {
  return `${value.toFixed(decimals)}%`;
};

// Abreviar números grandes
export const abbreviateNumber = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Formatear tamaño de archivo
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Calcular porcentaje
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

// Redondear a decimales
export const roundTo = (number, decimals = 2) => {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Clamp número entre min y max
export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};
