'use client';

import { FileQuestion, Package, Users, Search, Inbox } from 'lucide-react';

/**
 * Componentes de empty states reutilizables
 */

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  actionLabel,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={64} />
      </div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {action && (
        <button onClick={action} className="btn-primary">
          {actionLabel || 'Comenzar'}
        </button>
      )}
    </div>
  );
}

// Empty states predefinidos
export function NoResults({ searchTerm }) {
  return (
    <EmptyState
      icon={Search}
      title="Sin resultados"
      description={`No se encontraron resultados para "${searchTerm}"`}
    />
  );
}

export function NoData({ entity = 'registros', onCreate }) {
  return (
    <EmptyState
      icon={Package}
      title={`No hay ${entity}`}
      description={`Aún no has creado ningún ${entity.slice(0, -1)}`}
      action={onCreate}
      actionLabel="Crear Nuevo"
    />
  );
}

export function NoUsers({ onInvite }) {
  return (
    <EmptyState
      icon={Users}
      title="No hay usuarios"
      description="Invita a tu equipo para comenzar a colaborar"
      action={onInvite}
      actionLabel="Invitar Usuarios"
    />
  );
}

export function NotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Página no encontrada"
      description="La página que buscas no existe o fue movida"
    />
  );
}
