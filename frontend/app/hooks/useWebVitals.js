'use client';

import { useEffect } from 'react';

/**
 * Hook para reportar Web Vitals a Analytics
 * Monitorea Core Web Vitals (CLS, FID, LCP, FCP, TTFB)
 */
export function useWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Función para reportar métricas
    const reportMetric = (metric) => {
      const { name, value, rating, id } = metric;
      
      // Log en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${name}:`, {
          value: Math.round(value),
          rating,
          id,
        });
      }

      // Enviar a Analytics en producción
      if (window.gtag) {
        window.gtag('event', name, {
          event_category: 'Web Vitals',
          value: Math.round(value),
          event_label: id,
          non_interaction: true,
        });
      }
    };

    // Importar y usar web-vitals si está disponible
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportMetric);
      getFID(reportMetric);
      getFCP(reportMetric);
      getLCP(reportMetric);
      getTTFB(reportMetric);
    }).catch(() => {
      // web-vitals no instalado
      console.log('web-vitals not installed');
    });
  }, []);
}

/**
 * Performance Monitor Component
 * Muestra métricas de performance en desarrollo
 */
export function PerformanceMonitor() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="performance-monitor">
      <div className="performance-badge">
        ⚡ Performance Monitor Active
      </div>
    </div>
  );
}
