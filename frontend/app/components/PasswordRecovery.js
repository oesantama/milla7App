// ruta: frontend/app/components/PasswordRecovery.js
'use client';

import { useState } from 'react';
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function PasswordRecovery({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(''); // 'success' o 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Simulación de envío (ajustar cuando tengas el endpoint real)
    setTimeout(() => {
      setIsLoading(false);
      setMessageType('success');
      setMessage('Hemos enviado las instrucciones de recuperación a ' + email + '. Por favor, revisa tu bandeja de entrada y la carpeta de spam.');
      setEmail('');
      // Modal stays open for user to read message
    }, 1500);

    // TODO: Cuando tengas el endpoint de recuperación, usa esto:
    // try {
    //   await api.post('/api/users/password-reset/', { email });
    //   setMessageType('success');
    //   setMessage('Se ha enviado un correo con instrucciones.');
    // } catch (error) {
    //   setMessageType('error');
    //   setMessage(error.userMessage || 'Error al enviar el correo.');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <Mail size={48} className="modal-icon" />
          <h2>Recuperar Contraseña</h2>
          <p className="modal-subtitle">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="recovery-form">
          <div className="form-group">
            <label htmlFor="recovery-email">Correo Electrónico</label>
            <input
              id="recovery-email"
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
                'Enviar Instrucciones'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
