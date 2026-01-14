'use client';

import { useState } from 'react';
import { X, User, CheckCircle, AlertCircle } from 'lucide-react';

export default function UsernameRecovery({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(''); // 'success' o 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Mock Backend Call
    setTimeout(() => {
      setIsLoading(false);
      setMessageType('success');
      // Generic message for privacy as per spec
      setMessage('Si el correo coincide con nuestros registros, te hemos enviado tu nombre de usuario.');
      setEmail('');
      // Keep modal open so user can read message
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <User size={48} className="modal-icon" />
          <h2>Recuperar Usuario</h2>
          <p className="modal-subtitle">
            Ingresa tu correo electrónico registrado y te enviaremos tu nombre de usuario.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="recovery-form">
          <div className="form-group">
            <label htmlFor="username-recovery-email">Correo Electrónico</label>
            <input
              id="username-recovery-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="recovery-input"
              disabled={isLoading}
            />
          </div>

          {message && (
            <div className={`recovery-message ${messageType}`}>
              {messageType === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message}</span>
            </div>
          )}

          <div className="recovery-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-small"></span>
                  Enviando...
                </>
              ) : (
                'Enviarme mi usuario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
