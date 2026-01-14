'use client';

import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';

import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <header className="header-container">
      <ThemeToggle />
      
      <div 
        className="user-profile-header" 
        style={{cursor: 'pointer', position: 'relative'}}
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
      >
        <div className="header-user-info">
          <span className="header-username">{user?.username || 'Usuario'}</span>
          <span className="header-role">{user?.role_name || 'Sin rol'}</span>
        </div>
        <div className="header-avatar">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>

        {/* Mini Menu Dropdown */}
        {isUserMenuOpen && (
            <div className="user-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="px-4 py-3 border-b border-gray-100 mb-2" style={{ backgroundColor: '#eff6ff', borderBottom: '1px solid #eef2f6', textAlign: 'center' }}>
                    <p className="text-sm font-bold" style={{ color: '#1e40af', fontWeight: 'bold' }}>{user?.username || 'Usuario'}</p>
                    <p className="text-xs font-medium uppercase mt-0.5" style={{ color: '#2563eb' }}>{user?.role_name || 'Sin rol'}</p>
                </div>
                <button onClick={() => { setIsUserMenuOpen(false); router.push('/profile'); }}>
                    <i className="fa fa-user mr-2 text-gray-400"></i> Editar Perfil
                </button>
                <button onClick={() => { setIsUserMenuOpen(false); setShowChangelog(true); }}>
                    <i className="fa fa-rocket mr-2 text-gray-400"></i> Novedades
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                    <button onClick={logout} className="text-red-600 hover:bg-red-50">
                        <i className="fa fa-sign-out-alt mr-2"></i> Cerrar Sesión
                    </button>
                </div>
            </div>
        )}
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

    </header>
  );
}
