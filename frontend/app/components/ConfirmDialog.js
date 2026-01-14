'use client';

import { createContext, useContext, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});

  const confirm = ({
    title = '¿Estás seguro?',
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger', // danger, warning, info, success
    onConfirm,
    onCancel,
  }) => {
    return new Promise((resolve) => {
      setConfig({
        title,
        message,
        confirmText,
        cancelText,
        variant,
        onConfirm: () => {
          onConfirm?.();
          setIsOpen(false);
          resolve(true);
        },
        onCancel: () => {
          onCancel?.();
          setIsOpen(false);
          resolve(false);
        },
      });
      setIsOpen(true);
    });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && <ConfirmDialog config={config} />}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm debe usarse dentro de ConfirmProvider');
  }
  return context;
}

function ConfirmDialog({ config }) {
  const {
    title,
    message,
    confirmText,
    cancelText,
    variant,
    onConfirm,
    onCancel,
  } = config;

  const variants = {
    danger: {
      icon: XCircle,
      color: '#e53935',
      bg: '#ffebee',
    },
    warning: {
      icon: AlertTriangle,
      color: '#fb8c00',
      bg: '#fff3e0',
    },
    info: {
      icon: Info,
      color: '#1976d2',
      bg: '#e3f2fd',
    },
    success: {
      icon: CheckCircle,
      color: '#43a047',
      bg: '#e8f5e9',
    },
  };

  const variantConfig = variants[variant] || variants.danger;
  const Icon = variantConfig.icon;

  return (
    <>
      <div className="confirm-overlay" onClick={onCancel}></div>
      <div className="confirm-dialog">
        <div
          className="confirm-icon"
          style={{
            background: variantConfig.bg,
            color: variantConfig.color,
          }}
        >
          <Icon size={32} />
        </div>

        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button className="confirm-btn confirm-btn-cancel btn-cancel" onClick={onCancel} style={{ backgroundColor: '#e53935', color: 'white' }}>
            {cancelText}
          </button>
          <button
            className={`confirm-btn confirm-btn-confirm confirm-btn-${variant}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  );
}
