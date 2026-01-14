'use client';

import { useState } from 'react';
import { Shield, Key, Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Componente para habilitar 2FA (Two-Factor Authentication)
 * Genera QR code y códigos de backup
 */
export default function TwoFactorSetup({ userId, onComplete }) {
  const [step, setStep] = useState(1); // 1: Intro, 2: QR, 3: Verify, 4: Backup
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  const generateSecret = async () => {
    // TODO: Llamada al backend para generar secret
    const mockSecret = 'JBSWY3DPEHPK3PXP';
    const mockQR = `otpauth://totp/Milla7:user@example.com?secret=${mockSecret}&issuer=Milla7`;
    
    setSecret(mockSecret);
    setQrCode(mockQR);
    setStep(2);
  };

  const verifyCode = async () => {
    // TODO: Verificar código con backend
    if (verificationCode.length === 6) {
      // Generar códigos de backup
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);
      setStep(4);
      toast.success('2FA verificado correctamente');
    } else {
      toast.error('Código inválido');
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('Códigos copiados al portapapeles');
  };

  const finish = () => {
    toast.success('2FA habilitado exitosamente');
    onComplete?.();
  };

  return (
    <div className="two-factor-setup">
      {/* Step 1: Introducción */}
      {step === 1 && (
        <div className="setup-step">
          <div className="setup-icon">
            <Shield size={48} color="#1976d2" />
          </div>
          <h2>Autenticación de Dos Factores</h2>
          <p>
            Agrega una capa extra de seguridad a tu cuenta. Necesitarás tu
            teléfono con una app como Google Authenticator o Authy.
          </p>
          <ul className="setup-benefits">
            <li>✓ Protección contra accesos no autorizados</li>
            <li>✓ Requerido para administradores</li>
            <li>✓ Códigos de backup incluidos</li>
          </ul>
          <button className="btn-primary" onClick={generateSecret}>
            <Key size={18} />
            Comenzar Configuración
          </button>
        </div>
      )}

      {/* Step 2: Escanear QR */}
      {step === 2 && (
        <div className="setup-step">
          <h2>Escanea el Código QR</h2>
          <p>Abre tu app de autenticación y escanea este código:</p>
          
          <div className="qr-container">
            {/* Aquí iría el QR real, por ahora placeholder */}
            <div className="qr-placeholder">
              <p>QR Code Placeholder</p>
              <p className="secret-code">Secret: {secret}</p>
            </div>
          </div>

          <p className="setup-hint">
            O ingresa manualmente: <code>{secret}</code>
          </p>

          <button className="btn-primary" onClick={() => setStep(3)}>
            Continuar
          </button>
        </div>
      )}

      {/* Step 3: Verificar código */}
      {step === 3 && (
        <div className="setup-step">
          <h2>Verifica el Código</h2>
          <p>Ingresa el código de 6 dígitos de tu app:</p>
          
          <input
            type="text"
            maxLength="6"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="code-input"
            autoFocus
          />

          <button
            className="btn-primary"
            onClick={verifyCode}
            disabled={verificationCode.length !== 6}
          >
            Verificar
          </button>
        </div>
      )}

      {/* Step 4: Códigos de backup */}
      {step === 4 && (
        <div className="setup-step">
          <div className="setup-icon">
            <CheckCircle size={48} color="#66BB6A" />
          </div>
          <h2>Códigos de Respaldo</h2>
          <p>
            Guarda estos códigos en un lugar seguro. Cada uno puede usarse una sola vez
            si pierdes acceso a tu dispositivo.
          </p>

          <div className="backup-codes">
            {backupCodes.map((code, index) => (
              <div key={index} className="backup-code">
                {code}
              </div>
            ))}
          </div>

          <button className="btn-secondary" onClick={copyBackupCodes}>
            <Copy size={18} />
            Copiar Códigos
          </button>

          <button className="btn-primary" onClick={finish}>
            Finalizar Configuración
          </button>
        </div>
      )}
    </div>
  );
}
