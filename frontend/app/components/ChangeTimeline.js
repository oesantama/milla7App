'use client';

import { Clock, CheckCircle, AlertCircle, User } from 'lucide-react';

/**
 * Componente de timeline de cambios
 * Muestra historial de cambios en una entidad
 */
export default function ChangeTimeline({ changes = [] }) {
  // Datos de ejemplo si no se pasan cambios
  const defaultChanges = [
    {
      id: 1,
      type: 'create',
      description: 'Operación creada',
      user: 'Admin',
      timestamp: '2025-12-26 09:00',
      details: 'Estado inicial: Pendiente',
    },
    {
      id: 2,
      type: 'update',
      description: 'Estado actualizado',
      user: 'Juan Pérez',
      timestamp: '2025-12-26 10:30',
      details: 'De "Pendiente" a "En Proceso"',
    },
    {
      id: 3,
      type: 'update',
      description: 'Documento agregado',
      user: 'María López',
      timestamp: '2025-12-26 11:15',
      details: 'Archivo: factura.pdf',
    },
    {
      id: 4,
      type: 'comment',
      description: 'Comentario agregado',
      user: 'Carlos Ruiz',
      timestamp: '2025-12-26 12:00',
      details: 'Todo listo para continuar',
    },
  ];

  const displayChanges = changes.length > 0 ? changes : defaultChanges;

  const getIcon = (type) => {
    switch (type) {
      case 'create':
        return <CheckCircle size={20} />;
      case 'update':
        return <Clock size={20} />;
      case 'comment':
        return <User size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'create':
        return '#66BB6A';
      case 'update':
        return '#42A5F5';
      case 'comment':
        return '#FFA726';
      default:
        return '#9E9E9E';
    }
  };

    <div className="change-timeline" style={{position:'relative'}}>
      <h3 style={{marginBottom:'15px',color:'#333',fontWeight:'600'}}>Historial de Cambios</h3>
      <div className="timeline-container" style={{maxHeight:'300px', overflowY:'auto', paddingRight:'5px', paddingBottom:'20px'}}>
        {displayChanges.map((change, index) => (
          <div key={change.id} className="timeline-item">
            <div
              className="timeline-marker"
              style={{ background: getTypeColor(change.type) }}
            >
              {getIcon(change.type)}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <strong>{change.description}</strong>
                <span className="timeline-time">{change.timestamp}</span>
              </div>
              <div className="timeline-user">
                <User size={14} />
                {change.user}
              </div>
              {change.details && (
                <p className="timeline-details">{change.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Fade overlay for scroll affordance */}
      <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '100%',
          height: '40px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))',
          pointerEvents: 'none'
      }}></div>
    </div>
  );
}
