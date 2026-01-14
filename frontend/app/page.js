// ruta: frontend/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import LoadingScreen from './components/LoadingScreen';
import PasswordRecovery from './components/PasswordRecovery';
import UsernameRecovery from './components/UsernameRecovery';
import { useAuth } from './context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showUsernameRecovery, setShowUsernameRecovery] = useState(false);
  
  // Brute Force Simulation
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);
  
  // UI States
  const [showPasswordReqs, setShowPasswordReqs] = useState(false);

  const { login } = useAuth();

  // Cargar usuario guardado al montar el componente
  useEffect(() => {
    const savedUsername = localStorage.getItem('remembered_username');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleCapsLock = (e) => {
    setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'));
  };

  // Effect for Timer
  useEffect(() => {
    let interval;
    if (isBlocked && blockTimer > 0) {
      interval = setInterval(() => {
        setBlockTimer((prev) => {
           if (prev <= 1000) {
             setIsBlocked(false);
             setFailedAttempts(0);
             return 0;
           }
           return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBlocked, blockTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBlocked) return;
    
    setError('');
    setIsLoading(true);

    try {
      // Guardar usuario si "Recordar usuario" está marcado
      if (rememberMe) {
        localStorage.setItem('remembered_username', username);
      } else {
        localStorage.removeItem('remembered_username');
      }

      await login(username, password);
      // Success resets attempts
      setFailedAttempts(0); 
    } catch (err) {
      const errorMessage = err.userMessage || 'Credenciales inválidas. Por favor, inténtelo de nuevo.';
      setError(errorMessage);
      
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= 5) {
         setIsBlocked(true);
         setBlockTimer(15 * 60 * 1000); // 15 minutes
         setError('Cuenta bloqueada temporalmente.');
      }
      
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg">
      {isLoading && <LoadingScreen message="Verificando usuario..." />}
      
      <PasswordRecovery 
        isOpen={showRecovery} 
        onClose={() => setShowRecovery(false)} 
      />
      
      <UsernameRecovery 
        isOpen={showUsernameRecovery} 
        onClose={() => setShowUsernameRecovery(false)} 
      />

      <div className="login-container">
        <div className="login-left">
          <img
            src="/login_background.jpg"
            alt="M7 Analytics"
            className="login-illustration"
          />
        </div>

        <div className="login-right">
          <div className="login-logo">
            <img src="/milla7.jpg" alt="Milla 7 Logo" style={{ width: '150px', height: 'auto' }} />
          </div>
          
          <h1 className="login-title">BIENVENIDO</h1>
          
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Campo de Usuario */}
            <div className="input-group floating-label-group">
              <span className="input-icon">
                <User size={20} />
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-field has-floating-label"
                autoComplete="username"
                placeholder=" "
                disabled={isBlocked}
              />
              <label htmlFor="username" className="floating-label">Correo Electrónico o Usuario</label>
            </div>

            {/* Campo de Contraseña */}
            <div className="input-group floating-label-group" style={{position: 'relative'}}>
              <span className="input-icon">
                <Lock size={20} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={handleCapsLock}
                onKeyDown={handleCapsLock}
                onFocus={() => setShowPasswordReqs(true)}
                onBlur={() => setShowPasswordReqs(false)}
                required
                className="input-field has-floating-label"
                autoComplete="current-password"
                placeholder=" "
                disabled={isBlocked}
              />
              <label htmlFor="password" className="floating-label">Contraseña</label>
              
              {/* Caps Lock Indicator inside input */}
              {capsLockOn && (
                <div className="caps-lock-indicator" title="Bloq Mayús activado">
                   ⇪
                </div>
              )}

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                disabled={isBlocked}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {/* Password Requirements Tooltip */}
              {showPasswordReqs && (
                <div className="password-requirements-popper">
                   <p><strong>Requisitos de contraseña:</strong></p>
                   <ul>
                     <li className={password.length >= 8 ? 'valid' : ''}>Mín. 8 caracteres</li>
                     <li className={/[A-Z]/.test(password) ? 'valid' : ''}>Una mayúscula</li>
                     <li className={/[0-9]/.test(password) ? 'valid' : ''}>Un número</li>
                     <li className={/[!@#$%^&*]/.test(password) ? 'valid' : ''}>Un símbolo</li>
                   </ul>
                </div>
              )}
            </div>
            
            {/* Caps Lock Warning Text (legacy/extra visibility) */}
            {capsLockOn && (
               <div className="caps-lock-text">
                  ⇪ Bloq Mayús activado
               </div>
            )}


            {/* Checkbox Recordar Usuario */}
            <div className="remember-me">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                  disabled={isBlocked}
                />
                <span className="checkbox-text">Mantener sesión iniciada</span>
              </label>
              <div className="info-tooltip-container">
                 <span className="info-icon">i</span>
                 <div className="info-tooltip">
                    Al marcar esta opción, tu sesión permanecerá activa en este navegador durante <strong>30 días</strong> para que no tengas que ingresar tus datos nuevamente.<br/><br/>
                    ⚠️ <strong>Importante:</strong> Por seguridad, <strong>no actives</strong> esta opción si estás usando un dispositivo público o compartido.
                 </div>
              </div>
            </div>

            {/* Brute Force Warning */}
            {failedAttempts >= 3 && !isBlocked && (
              <div className="warning-message">
                 <AlertCircle size={16} />
                 <span>Usuario o contraseña incorrectos. Te quedan <strong>{5 - failedAttempts} intentos</strong> antes de bloquear la cuenta temporalmente.</span>
              </div>
            )}

            {/* Blocked Message */}
            {isBlocked && (
               <div className="error-message blocked-message">
                  <AlertCircle size={18} />
                  <span>Por seguridad, tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos. Por favor, intenta en <strong>{Math.ceil(blockTimer / 1000)} seg</strong> o restablece tu contraseña.</span>
               </div>
            )}

            {/* Botón de Login */}
            <div className="login-actions">
              <button
                type="submit"
                className="btn login-btn"
                disabled={isLoading || isBlocked}
              >
                {isLoading ? 'Ingresando...' : 'INICIAR SESIÓN'}
              </button>
            </div>

            {/* Links */}
            <div className="login-links-group">
               <button
                 type="button"
                 onClick={() => setShowRecovery(true)}
                 className="recover-link"
                 disabled={isBlocked}
               >
                 ¿Olvidaste tu contraseña?
               </button>
               <button
                 type="button"
                 onClick={() => setShowUsernameRecovery(true)}
                 className="recover-link secondary-link"
                 disabled={isBlocked}
               >
                 ¿Olvidaste tu usuario?
               </button>
            </div>

            {/* General Error (only if attempts < 3 to avoid distraction from warning) */}
            {error && failedAttempts < 3 && !isBlocked && (
              <div className="error-message">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>
      </div>

      <style jsx>{`
        .floating-label-group { position: relative; margin-bottom: 25px; }
        .input-field { 
           padding-top: 15px; 
           padding-bottom: 5px; 
           height: 50px; 
        }
        /* Floating logic: when placeholder shown (empty), label is big inside. When not (typed) or focus, label moves up */
        .input-field:placeholder-shown + .floating-label {
           top: 15px;
           font-size: 16px;
           color: #666;
           left: 45px;
        }
        .floating-label {
           position: absolute;
           left: 45px;
           top: 2px;
           font-size: 11px;
           color: #666;
           transition: all 0.2s ease;
           pointer-events: none;
           background: transparent;
        }
        .input-field:focus + .floating-label,
        .input-field:not(:placeholder-shown) + .floating-label {
           top: 5px;
           font-size: 11px;
           font-weight: 600;
           color: #007bff;
        }
        /* Make real placeholder invisible but use it for :placeholder-shown trick */
        .input-field::placeholder { color: transparent; }

        .caps-lock-indicator {
           position: absolute;
           right: 45px; /* left of eye icon */
           top: 50%;
           transform: translateY(-50%);
           background: #eee;
           padding: 2px 6px;
           border-radius: 4px;
           font-size: 14px;
           color: #333;
           border: 1px solid #ccc;
           cursor: help;
        }
        .caps-lock-text { color: #d32f2f; font-size: 0.85rem; margin-top: -15px; margin-bottom: 10px; display: flex; align-items: center; gap: 5px;}

        .info-tooltip-container { position: relative; display: inline-block; margin-left: 8px; }
        .info-icon { 
           background: #e0e0e0; color: #666; 
           border-radius: 50%; width: 16px; height: 16px; 
           display: flex; align-items: center; justify-content: center; 
           font-size: 11px; cursor: help; 
        }
        .info-tooltip {
           visibility: hidden;
           width: 280px;
           background-color: #333;
           color: #fff;
           text-align: left;
           border-radius: 6px;
           padding: 10px;
           position: absolute;
           z-index: 10;
           bottom: 125%; /* Position above */
           left: 50%;
           margin-left: -140px;
           opacity: 0;
           transition: opacity 0.3s;
           font-size: 0.85rem;
           box-shadow: 0 4px 8px rgba(0,0,0,0.2);
           line-height: 1.4;
        }
        .info-tooltip-container:hover .info-tooltip { visibility: visible; opacity: 1; }

        .password-requirements-popper {
           position: absolute;
           bottom: 100%;
           left: 0;
           width: 100%;
           background: white;
           border: 1px solid #ddd;
           padding: 10px;
           border-radius: 5px;
           box-shadow: 0 4px 10px rgba(0,0,0,0.1);
           font-size: 0.8rem;
           margin-bottom: 5px;
           z-index: 20;
        }
        .password-requirements-popper ul { list-style: none; padding: 0; margin: 5px 0 0 0; }
        .password-requirements-popper li { color: #d32f2f; padding-left: 15px; position: relative; }
        .password-requirements-popper li::before { content: '•'; position: absolute; left: 0; }
        .password-requirements-popper li.valid { color: #2e7d32; }
        .password-requirements-popper li.valid::before { content: '✓'; }

        .warning-message {
           background-color: #fff3cd; color: #856404; 
           padding: 10px; border-radius: 5px; margin-bottom: 15px; 
           display: flex; gap: 10px; align-items: center; font-size: 0.9em;
           border: 1px solid #ffeeba;
        }
        .login-links-group { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; margin-top: 15px; }
        .secondary-link { font-size: 0.85rem; color: #666; }
      `}</style>
    </div>
  );
}
