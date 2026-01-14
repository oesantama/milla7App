'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useMenuData } from '../hooks/useMenuData';
import MenuItem from './MenuItem'; // I'll assume a MenuItem component for cleaner code

export default function Menu({ isCollapsed }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { menuData, loading, error } = useMenuData();

  // State to manage expanded modules, initialize all to closed (empty set)
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [showChangelog, setShowChangelog] = useState(false);

  const handleNav = (url) => {
    router.push(url);
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Cargando menú...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  // Grouping Logic (P6)
  const groupedMenu = {
    'LOGÍSTICA': [],
    'ADMINISTRACIÓN': [],
    'OTROS': []
  };

  menuData.forEach(item => {
    const name = item.descripcion_modulo.toLowerCase();
    if (name.includes('conductores') || name.includes('vehiculos') || name.includes('rutas') || name.includes('operaciones') || name.includes('pedidos') || name.includes('logística')) {
      groupedMenu['LOGÍSTICA'].push(item);
    } else if (name.includes('usuario') || name.includes('rol') || name.includes('permiso') || name.includes('administr')) {
      groupedMenu['ADMINISTRACIÓN'].push(item);
    } else {
      groupedMenu['OTROS'].push(item);
    }
  });

  const handleKeyDown = (e, item, type) => {
    // P21 Keyboard Nav
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (type === 'module' && item.es_expansivo) {
        toggleModule(item.id);
      } else {
        handleNav(item.route);
      }
    }
  };

  return (
    <nav className="menu-container w-full" role="navigation" aria-label="Menú principal">
      <div className="menu-content flex-grow overflow-y-auto px-2">
        <MenuItem
          label="Desktop"
          icon="🖥️"
          url="/desktop"
          isActive={pathname === '/desktop'}
          onClick={() => handleNav('/desktop')}
          role="menuitem"
        />

        {menuData.map((modulo) => (
          <div key={modulo.id} className="menu-group mb-4">
             {/* If we wanted headers we'd put them here, but user asked to REMOVE them */}
             <div className="menu-section mb-1" role="presentation">
                  {(modulo.es_expansivo || modulo.descripcion_modulo.toLowerCase() === 'operaciones') ? (
                    <>
                      <button
                        className="section-toggle w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => toggleModule(modulo.id)}
                        onKeyDown={(e) => handleKeyDown(e, modulo, 'module')}
                        aria-expanded={expandedModules.has(modulo.id)}
                        aria-controls={`submenu-${modulo.id}`}
                        title={isCollapsed ? modulo.descripcion_modulo : ''}
                      >
                        <i className={`fa ${modulo.icono || 'fa-folder'} w-5 text-center mr-3 text-gray-500`}></i>
                        {!isCollapsed && (
                             <>
                                <span className="flex-grow font-medium text-gray-700 dark:text-gray-300 text-sm">{modulo.descripcion_modulo}</span>
                                <span className="text-gray-400 text-xs transform transition-transform duration-200">
                                {expandedModules.has(modulo.id) ? '▲' : '▼'}
                                </span>
                             </>
                        )}
                      </button>
                      {expandedModules.has(modulo.id) && !isCollapsed && (
                        <div id={`submenu-${modulo.id}`} className="section-items ml-4 pl-2 border-l-2 border-gray-100 dark:border-gray-800 my-1">
                          {modulo.paginas && modulo.paginas.length > 0 ? (
                             modulo.paginas.map((pagina) => (
                              <MenuItem
                                key={pagina.id}
                                label={pagina.descripcion_pages}
                                icon={pagina.icono}
                                url={pagina.route}
                                isActive={pathname?.startsWith(pagina.route)}
                                onClick={() => handleNav(pagina.route)}
                              />
                            ))
                          ) : (
                             // Fallback for Operations which might not have pages in 'menuData' but needs subitems manually for demo/fix (P5)
                             modulo.descripcion_modulo.toLowerCase() === 'operaciones' && (
                               <>
                                 <MenuItem label="Tablero de Control" icon="fa-dashboard" url="/operaciones/dashboard" onClick={() => handleNav('/operaciones/dashboard')} />
                                 <MenuItem label="Mis Asignaciones" icon="fa-tasks" url="/operaciones/asignaciones" onClick={() => handleNav('/operaciones/asignaciones')} />
                               </>
                             )
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div title={isCollapsed ? modulo.descripcion_modulo : ''}>
                        <MenuItem
                        key={modulo.id}
                        label={isCollapsed ? '' : modulo.descripcion_modulo}
                        icon={modulo.icono}
                        url={modulo.route}
                        isActive={pathname?.startsWith(modulo.route)}
                        onClick={() => handleNav(modulo.route)}
                        />
                    </div>
                  )}
            </div>
          </div>
        ))}
      </div>

      {/* Logout & Version (P1) */}
      <div className="sidebar-actions p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <button
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={logout}
          aria-label="Cerrar sesión"
        >
          <span>⏻</span> Cerrar sesión
        </button>
        <button 
          className="text-center mt-4 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 font-mono w-full cursor-help"
          title="Ver historial de cambios"
          onClick={() => setShowChangelog(true)}
        >
          M7 Analytics v1.2.0
        </button>
      </div>
      
      {/* Changelog Modal */}
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
    </nav>
  );
}