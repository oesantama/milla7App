'use client';

import { useState } from 'react';
import { Monitor, Smartphone, Tablet, X, MapPin } from 'lucide-react';
import { useConfirm } from './ConfirmDialog';
import toast from 'react-hot-toast';

/**
 * Componente para gestionar sesiones activas del usuario
 * Muestra dispositivos conectados y permite cerrar sesiones
 */
export default function ActiveSessions({ userId }) {
  const { confirm } = useConfirm();
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: 'Chrome en Windows',
      deviceType: 'desktop',
      ip: '192.168.1.100',
      location: 'Bogotá, Colombia',
      lastActivity: '2025-12-26 15:00',
      current: true,
    },
    {
      id: 2,
      device: 'Safari en iPhone',
      deviceType: 'mobile',
      ip: '192.168.1.101',
      location: 'Bogotá, Colombia',
      lastActivity: '2025-12-26 12:30',
      current: false,
    },
    {
      id: 3,
      device: 'Chrome en Android',
      deviceType: 'tablet',
      ip: '192.168.1.102',
      location: 'Medellín, Colombia',
      lastActivity: '2025-12-25 18:00',
      current: false,
    },
  ]);

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'mobile':
        return <Smartphone size={24} />;
      case 'tablet':
        return <Tablet size={24} />;
      default:
        return <Monitor size={24} />;
    }
  };

  const handleCloseSession = async (session) => {
    const confirmed = await confirm({
      title: 'Cerrar Sesión',
      message: `¿Cerrar la sesión en "${session.device}"?`,
      variant: 'warning',
      confirmText: 'Cerrar Sesión',
    });

    if (confirmed) {
      // TODO: Llamada al backend
      setSessions(prev => prev.filter(s => s.id !== session.id));
      toast.success('Sesión cerrada');
    }
  };

  const handleCloseAllOthers = async () => {
    const confirmed = await confirm({
      title: 'Cerrar Todas las Otras Sesiones',
      message: 'Esto cerrará todas las sesiones excepto la actual. Tendrás que volver a iniciar sesión en otros dispositivos.',
      variant: 'warning',
      confirmText: 'Cerrar Todas',
    });

    if (confirmed) {
      // TODO: Llamada al backend
      setSessions(prev => prev.filter(s => s.current));
      toast.success('Todas las otras sesiones cerradas');
    }
  };

  return (
    <div className="active-sessions">
      <div className="sessions-header">
        <div>
          <h2>Sesiones Activas</h2>
          <p className="sessions-subtitle">
            Administra los dispositivos con acceso a tu cuenta
          </p>
        </div>
        {sessions.length > 1 && (
          <button className="btn-secondary" onClick={handleCloseAllOthers}>
            Cerrar Otras Sesiones
          </button>
        )}
      </div>

      <div className="sessions-list">
        {sessions.map(session => (
          <div key={session.id} className={`session-card ${session.current ? 'current' : ''}`}>
            <div className="session-icon">
              {getDeviceIcon(session.deviceType)}
            </div>
            
            <div className="session-info">
              <div className="session-device">
                {session.device}
                {session.current && (
                  <span className="current-badge">Esta sesión</span>
                )}
              </div>
              
              <div className="session-details">
                <div className="session-detail">
                  <MapPin size={14} />
                  {session.location}
                </div>
                <div className="session-detail">
                  IP: {session.ip}
                </div>
                <div className="session-detail">
                  Última actividad: {session.lastActivity}
                </div>
              </div>
            </div>

            {!session.current && (
              <button
                className="btn-close-session"
                onClick={() => handleCloseSession(session)}
                aria-label="Cerrar sesión"
              >
                <X size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="sessions-hint">
        <p>
          💡 Si ves una sesión que no reconoces, ciérrala inmediatamente y
          cambia tu contraseña.
        </p>
      </div>
    </div>
  );
}
