'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook para atajos de teclado globales
 * Implementa navegación rápida y accesos directos
 */
export function useKeyboardShortcuts() {
  const router = useRouter();

  const shortcuts = useCallback({
    // Navegación
    'g d': () => router.push('/desktop'),
    'g u': () => router.push('/usuarios'),
    'g c': () => router.push('/clientes'),
    'g v': () => router.push('/vehiculos'),
    'g o': () => router.push('/operaciones'),
    
    // Acciones
    '?': () => {
      // Mostrar ayuda de atajos
      const helpText = `
Atajos de Teclado:
- Cmd/Ctrl + K: Búsqueda global
- g + d: Ir a Dashboard
- g + u: Ir a Usuarios
- g + c: Ir a Clientes
- g + v: Ir a Vehículos
- g + o: Ir a Operaciones
- ESC: Cerrar modales
- ?: Mostrar esta ayuda
      `;
      alert(helpText);
    },
  }, [router]);

  useEffect(() => {
    let keys = [];
    let timeout;

    const handleKeyDown = (e) => {
      // Ignorar si está en un input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Capturar tecla
      keys.push(e.key.toLowerCase());
      
      // Limpiar después de 1 segundo
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        keys = [];
      }, 1000);

      // Verificar combinación
      const combination = keys.join(' ');
      
      if (shortcuts[combination]) {
        e.preventDefault();
        shortcuts[combination]();
        keys = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [shortcuts]);
}

/**
 * Componente Skip Link para accesibilidad
 */
export function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Saltar al contenido principal
    </a>
  );
}
