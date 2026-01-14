'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Sistema de notificaciones en tiempo real
 * Context + Hook para gestionar notificaciones
 */
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // TODO: Conectar con WebSocket o Server-Sent Events
    // Simulación de notificaciones
    const mockNotifications = [
      {
        id: 1,
        type: 'success',
        title: 'Operación completada',
        message: 'La operación #234 fue completada exitosamente',
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: 2,
        type: 'warning',
        title: 'Documento pendiente',
        message: 'Falta subir el documento para la operación #235',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const addNotification = (notification) => {
    const newNotif = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Toast para notificación inmediata
    toast.custom((t) => (
      <div className={`notification-toast notification-${newNotif.type}`}>
        <strong>{newNotif.title}</strong>
        <p>{newNotif.message}</p>
      </div>
    ));
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        setIsOpen,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
}

/**
 * Componente bell icon con badge
 */
export function NotificationBell() {
  const { unreadCount, setIsOpen } = useNotifications();

  return (
    <button
      className="notification-bell"
      onClick={() => setIsOpen(true)}
      aria-label={`${unreadCount} notificaciones sin leer`}
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
      )}
    </button>
  );
}

/**
 * Panel de notificaciones
 */
export function NotificationPanel() {
  const {
    notifications,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#66BB6A" />;
      case 'warning':
        return <AlertTriangle size={20} color="#FFA726" />;
      case 'error':
        return <X size={20} color="#E53935" />;
      default:
        return <Info size={20} color="#42A5F5" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  };

  return (
    <>
      <div className="notification-overlay" onClick={() => setIsOpen(false)} />
      <div className="notification-panel">
        <div className="notification-header">
          <h3>Notificaciones</h3>
          <div className="notification-actions">
            {notifications.length > 0 && (
              <>
                <button onClick={markAllAsRead} className="btn-text">
                  Marcar todas
                </button>
                <button onClick={clearAll} className="btn-text">
                  Limpiar
                </button>
              </>
            )}
            <button onClick={() => setIsOpen(false)} aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <Bell size={48} />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="notification-icon">{getIcon(notif.type)}</div>
                <div className="notification-content">
                  <div className="notification-title">{notif.title}</div>
                  <div className="notification-message">{notif.message}</div>
                  <div className="notification-time">{formatTime(notif.timestamp)}</div>
                </div>
                {!notif.read && <div className="notification-dot" />}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
