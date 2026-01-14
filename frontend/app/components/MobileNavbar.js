'use client';

import { Menu as MenuIcon, X } from 'lucide-react';
import { useState } from 'react';
import GlobalSearch from './GlobalSearch';
import { useAuth } from '../context/AuthContext';

import { useRouter } from 'next/navigation';

/**
 * Navbar móvil con menú hamburguesa
 */
export default function MobileNavbar({ onMenuClick, user }) {
  const { logout } = useAuth();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <>
    <div className="mobile-navbar">
      <button 
        className="hamburger-btn" 
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <MenuIcon size={24} />
      </button>

      <div className="mobile-navbar-logo">
        <img src="/milla7.jpg" alt="Milla 7" className="mobile-logo" />
      </div>

      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
        {/* Global Search Icon */}
        <GlobalSearch 
            trigger={
                <button className="hamburger-btn" aria-label="Buscar">
                    <i className="fas fa-search" style={{fontSize:'18px', color:'#1976d2'}}></i>
                </button>
            }
        />

        {/* User Avatar with Dropdown */}
        <div style={{position:'relative'}}>
            <div 
                className="mobile-navbar-user" 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{cursor:'pointer'}}
            >
                <div className="mobile-user-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
            </div>

            {/* Dropdown */}
            {isUserMenuOpen && (
                <div 
                    className="user-dropdown mobile-dropdown" 
                    style={{
                        position: 'fixed', // Fixed to ensure visibility over everything
                        top: '60px', 
                        right: '10px', 
                        width: '200px',
                        zIndex: 2002, // Higher than navbar
                        background: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        borderRadius: '8px',
                        overflow:'hidden'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <p className="font-bold text-sm text-gray-800">{user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.role_name || user?.role}</p>
                    </div>
                    <button onClick={() => { setIsUserMenuOpen(false); router.push('/profile'); }}>
                        <i className="fa fa-user mr-2"></i> Editar Perfil
                    </button>
                    <button onClick={() => { setIsUserMenuOpen(false); setShowChangelog(true); }}>
                        <i className="fa fa-rocket mr-2"></i> Novedades
                    </button>
                    <button onClick={logout} style={{color:'#e53935'}}>
                        <i className="fa fa-sign-out-alt mr-2"></i> Cerrar Sesión
                    </button>
                </div>
            )}
            
            {/* Backdrop for dropdown */}
            {isUserMenuOpen && (
                <div 
                    style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', zIndex:2001}} 
                    onClick={() => setIsUserMenuOpen(false)}
                />
            )}
        </div>
      </div>
    </div>
    
     {/* Changelog Modal (Reused) */}
     {showChangelog && (
          <div className="changelog-modal-overlay" onClick={() => setShowChangelog(false)}>
              <div className="changelog-modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="changelog-header">
                      <h3><i className="fa fa-rocket" style={{marginRight:'10px', color:'#1976d2'}}></i>Novedades de la Versión</h3>
                      <button onClick={() => setShowChangelog(false)} className="close-btn">&times;</button>
                  </div>
                  <div className="changelog-body">
                      <div className="version-tag">Actual: v1.2.0</div>
                      <ul className="changelog-list">
                          <li>✨ <strong>Mejoras UX/UI:</strong> Nueva experiencia de búsqueda global y navegación por teclado.</li>
                          <li>📊 <strong>Dashboard:</strong> Visualización mejorada de tarjetas con descripciones expandibles.</li>
                          <li>✅ <strong>Validaciones:</strong> Formularios más robustos con feedback en tiempo real.</li>
                          <li>📂 <strong>Documentos:</strong> Nueva interfaz para la gestión y carga de archivos en operaciones.</li>
                          <li>📱 <strong>Móvil:</strong> Optimización de la vista de login para dispositivos pequeños.</li>
                      </ul>
                      <div className="changelog-footer-note">
                          Milla 7 Analytics - {new Date().getFullYear()}
                      </div>
                  </div>
                  <div className="changelog-actions">
                      <button className="btn-primary" onClick={() => setShowChangelog(false)}>Entendido</button>
                  </div>
              </div>
              <style jsx>{`
                  .changelog-modal-overlay {
                      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                      background: rgba(0,0,0,0.5); backdrop-filter: blur(3px);
                      z-index: 9999; display: flex; align-items: center; justify-content: center;
                      animation: fadeIn 0.2s ease-out;
                      cursor: default;
                  }
                  .changelog-modal-content {
                      background: white; width: 90%; max-width: 450px;
                      border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                      overflow: hidden; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                  }
                  .changelog-header {
                      background: #f5f9ff; padding: 15px 20px; border-bottom: 1px solid #e3e8ee;
                      display: flex; justify-content: space-between; align-items: center;
                  }
                  .changelog-header h3 { margin: 0; font-size: 16px; color: #1565c0; font-weight: 700; }
                  .close-btn { background: none; border: none; font-size: 24px; color: #999; cursor: pointer; line-height: 1; }
                  
                  .changelog-body { padding: 25px 20px; }
                  .version-tag {
                      display: inline-block; background: #e3f2fd; color: #1565c0;
                      padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;
                      margin-bottom: 15px; border: 1px solid #bbdefb;
                  }
                  .changelog-list { list-style: none; padding: 0; margin: 0; }
                  .changelog-list li { margin-bottom: 12px; font-size: 14px; color: #444; line-height: 1.5; padding-left: 15px; position: relative; }
                  .changelog-list li::before { content: "•"; color: #1976d2; position: absolute; left: 0; font-weight: bold; }
                  
                  .changelog-footer-note { margin-top: 20px; font-size: 11px; color: #999; text-align: center; border-top: 1px dashed #eee; padding-top: 10px; }
                  
                  .changelog-actions { padding: 15px 20px; background: #fafafa; border-top: 1px solid #eee; text-align: right; }
                  .btn-primary { background: #1976d2; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px; }
                  .btn-primary:hover { background: #1565c0; }
                  
                  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              `}</style>
          </div>
      )}
    </>
  );
}
