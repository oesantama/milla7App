'use client';

import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Componentes de loading states reutilizables
 */

// Spinner simple
export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  return (
    <Loader2
      size={sizes[size]}
      className={`animate-spin ${className}`}
      aria-label="Cargando"
    />
  );
}

// Loading full page
export function LoadingPage({ message = 'Cargando...' }) {
  return (
    <div className="loading-page">
      <Spinner size="xl" />
      <p>{message}</p>
    </div>
  );
}

// Loading overlay
export function LoadingOverlay({ visible, message = 'Procesando...' }) {
  if (!visible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <Spinner size="lg" />
        <p>{message}</p>
      </div>
    </div>
  );
}

// Loading button
export function ButtonLoading({ loading, children, ...props }) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <>
          <Spinner size="sm" />
          <span>Cargando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Loading inline
export function InlineLoading({ message = 'Cargando...' }) {
  return (
    <div className="inline-loading">
      <Spinner size="sm" />
      <span>{message}</span>
    </div>
  );
}
