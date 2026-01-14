'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const routeNames = {
  '/desktop': 'Dashboard',
  '/usuarios': 'Usuarios',
  '/clientes': 'Clientes',
  '/vehiculos': 'Vehículos',
  '/conductores': 'Conductores',
  '/operaciones': 'Operaciones',
  '/maestras': 'Maestras',
  '/roles': 'Roles y Permisos',
  '/perfil': 'Mi Perfil',
  '/ayuda': 'Ayuda',
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // No mostrar en home o login
  if (!pathname || pathname === '/' || pathname === '/login') {
    return null;
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const name = routeNames[path] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { path, name };
  });

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link href="/desktop">
            <Home size={16} />
            <span className="breadcrumb-text">Inicio</span>
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path}>
            <ChevronRight size={16} className="breadcrumb-separator" />
            {index === breadcrumbs.length - 1 ? (
              <span className="breadcrumb-current">{crumb.name}</span>
            ) : (
              <Link href={crumb.path}>{crumb.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
