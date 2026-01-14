'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle } from 'lucide-react';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos
const WARNING_TIME = 2 * 60 * 1000; // 2 minutos antes

/**
 * Componente de auto-logout por inactividad
 */
export default function SessionTimeout() {
  const { logout, isAuthenticated } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // segundos

  const resetTimer = useCallback(() => {
    if (showWarning) return;
    
    // Resetear timers de inactividad
    const warningTimer = setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(120);
      
      // Countdown
      const countdown = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      //  Auto-logout final
      setTimeout(() => {
        logout();
      }, WARNING_TIME);
      
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    return () => clearTimeout(warningTimer);
  }, [showWarning, logout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, resetTimer]);

  const handleStayActive = () => {
    setShowWarning(false);
    resetTimer();
  };

  if (!showWarning || !isAuthenticated) return null;

  return (
    <div className="session-warning">
      <div className="session-warning-header">
        <AlertTriangle size={24} />
        <span>Sesión por expirar</span>
      </div>
      <div className="session-warning-body">
        Tu sesión se cerrará en {timeLeft} segundos por inactividad.
      </div>
      <div className="session-warning-actions">
        <button onClick={handleStayActive}>Mantener sesión activa</button>
        <button onClick={() => logout()}>Cerrar sesión</button>
      </div>
    </div>
  );
}
