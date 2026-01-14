'use client';

import { useState, useEffect } from 'react';

/**
 * Hook personalizado para detectar breakpoints responsive
 * 
 * Breakpoints:
 * - mobile: < 640px
 * - tablet: 640px - 1024px
 * - desktop: >= 1024px
 * 
 * @returns {Object} { isMobile, isTablet, isDesktop, width }
 */
export default function useMediaQuery() {
  const [breakpoint, setBreakpoint] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024
  });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setBreakpoint({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
        width
      });
    };

    // Ejecutar inmediatamente
    updateBreakpoint();

    // Escuchar cambios de tamaño con debounce
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateBreakpoint, 150);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return breakpoint;
}
