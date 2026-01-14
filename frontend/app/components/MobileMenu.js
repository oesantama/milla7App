'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';


/**
 * Menú drawer lateral para móviles
 */
export default function MobileMenu({ isOpen, onClose }) {
  const { user, logout, permissions, operations, selectedOperation, setSelectedOperation } = useAuth();
  const router = useRouter();
  const drawerRef = useRef(null);


  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);



  const handleNavigate = (path) => {
    router.push(path);
    onClose();
  };

  /* Unused state removed */

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="mobile-menu-overlay" onClick={onClose} />

      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`mobile-menu-drawer ${isOpen ? 'open' : ''}`}
      >
        {/* Header (Professional Style) */}
        <div className="mobile-menu-header" style={{
            background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
            padding: '20px',
            color: 'white'
        }}>
          <div className="mobile-menu-logo" style={{color: 'white'}}>
            <img src="/milla7.jpg" alt="Milla 7" style={{background:'white', padding:'2px', borderRadius:'4px'}} />
            <span style={{fontWeight:'700', letterSpacing:'0.5px'}}>Milla 7</span>
          </div>
          <button className="mobile-menu-close" onClick={onClose} style={{color:'white'}}>
            <X size={24} />
          </button>
        </div>

        {/* User Greeting (Visual only) */}
        <div style={{padding:'15px 20px', borderBottom:'1px solid #eee', background:'#f8f9fa'}}>
            <span style={{fontSize:'13px', color:'#666'}}>Hola, <strong>{user?.username}</strong> inside</span>
        </div>

        {/* Navigation */}
        <nav className="mobile-menu-nav">
          {/* Dashboard */}
          <button 
            className="mobile-menu-item"
            onClick={() => handleNavigate('/desktop')}
          >
            <span className="mobile-menu-icon">🏠</span>
            <span>Dashboard</span>
          </button>

          {/* Operaciones */}
          {operations && operations.length > 0 && (
            <div className="mobile-menu-section">
              <div className="mobile-menu-section-title">Operaciones</div>
              {operations.map((op) => (
                <button
                  key={op.id}
                  className={`mobile-menu-item ${selectedOperation?.id === op.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedOperation(op);
                    handleNavigate('/desktop');
                  }}
                >
                  <span className="mobile-menu-icon">📦</span>
                  <span>{op.nombre}</span>
                </button>
              ))}
            </div>
          )}

          {/* Módulos de Permisos */}
          {permissions && permissions.length > 0 && (
            <div className="mobile-menu-section">
              <div className="mobile-menu-section-title">Módulos</div>
              {permissions.map((perm) => (
                <button
                  key={perm.id}
                  className="mobile-menu-item"
                  onClick={() => {
                      if (perm.url_path) {
                          handleNavigate(perm.url_path);
                      } else {
                          // Fallback or alert if needed, but for now just close to avoid "broken" feel
                          onClose();
                      }
                  }}
                >
                  <span className="mobile-menu-icon">
                    {perm.icono ? <i className={perm.icono}></i> : '📄'}
                  </span>
                  <span>{perm.nombre}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="mobile-menu-footer">
          <div className="mobile-menu-tools">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
