'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

/**
 * Página 404 personalizada
 */
export default function NotFound() {
  return (
    <div className="page-404">
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Página No Encontrada</h2>
        <p className="error-message">
          La página que buscas no existe o ha sido movida.
        </p>

        {/* Búsqueda rápida */}
        <div className="error-search">
          <Search size={20} />
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            aria-label="Búsqueda"
          />
        </div>

        {/* Links sugeridos */}
        <div className="error-actions">
          <Link href="/desktop" className="btn-primary">
            <Home size={18} />
            Ir al Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft size={18} />
            Volver Atrás
          </button>
        </div>

        {/* Enlaces útiles */}
        <div className="error-links">
          <p>Enlaces útiles:</p>
          <ul>
            <li><Link href="/usuarios">Usuarios</Link></li>
            <li><Link href="/clientes">Clientes</Link></li>
            <li><Link href="/operaciones">Operaciones</Link></li>
            <li><Link href="/ayuda">Centro de Ayuda</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
