'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useConductores, useVehiculos, useClientes, useOperaciones } from '../hooks/useQueries';
import { useAuth } from '../context/AuthContext';

/**
 * Barra de búsqueda global con Cmd/Ctrl+K
 */
export default function GlobalSearch(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const router = useRouter();

  // Fetch Data
  const { permissions } = useAuth(); // Get permissions (modules & tabs) from context
  const { data: conductores = [] } = useConductores();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: clientes = [] } = useClientes();
  const { data: operaciones = [] } = useOperaciones();

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Utility for accent-insensitive search
  const normalizeText = (text) => {
    if (!text) return '';
    return text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const menuItems = [
      { name: 'Inicio', path: '/dashboard', type: 'NAVEGACIÓN', meta: 'Dashboard' },
      { name: 'Operaciones', path: '/operaciones', type: 'NAVEGACIÓN', meta: 'Módulo' },
      { name: 'Vehículos', path: '/maestras/vehiculos', type: 'NAVEGACIÓN', meta: 'Maestra' },
      { name: 'Conductores', path: '/maestras/conductores', type: 'NAVEGACIÓN', meta: 'Maestra' },
      { name: 'Clientes', path: '/maestras/clientes', type: 'NAVEGACIÓN', meta: 'Maestra' },
      { name: 'Usuarios', path: '/maestras/usuarios', type: 'NAVEGACIÓN', meta: 'Maestra' },
      { name: 'Configuración', path: '/configuracion', type: 'NAVEGACIÓN', meta: 'Sistema' },
  ];

  // Search Logic
  const filteredResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];

    const lowerQuery = normalizeText(debouncedQuery);
    const results = [];

    // 1. Navegación (Static)
    menuItems.forEach(item => {
        if (normalizeText(item.name).includes(lowerQuery)) {
            results.push({ ...item, id: item.path, category: 'NAVEGACIÓN' });
        }
    });

    // 1.1 Navegación (Dynamic Tabs/Sub-modules)
    if (permissions) {
        permissions.forEach(module => {
            // Search Module Name
            if (normalizeText(module.nombre).includes(lowerQuery)) {
                 results.push({
                    id: `mod-${module.id}`,
                    name: module.nombre,
                    path: module.url_path || '#', 
                    type: 'MÓDULO',
                    meta: `Módulo: ${module.descripcion || ''}`,
                    category: 'NAVEGACIÓN'
                 });
            }
            // Search Tabs
            if (module.tabs) {
                module.tabs.forEach(tab => {
                    // Combine all potential searchable text
                    const searchable = `
                        ${tab.nombre} 
                        ${tab.descripcion || ''} 
                        ${tab.contenido || ''} 
                        ${tab.page_title || ''}
                    `; 
                    if (normalizeText(searchable).includes(lowerQuery)) {
                        results.push({
                            id: `tab-${tab.id}`,
                            name: tab.nombre,
                            path: tab.url_path || '#',
                            type: 'PÁGINA',
                            // Show context in meta
                            meta: `${module.nombre} • ${tab.descripcion?.substring(0, 30) || 'Acceso directo'}`,
                            category: 'PÁGINAS'
                        });
                    }
                });
            }
        });
    }

    return results.slice(0, 20); // Max 20 results
  }, [debouncedQuery, conductores, vehiculos, clientes, operaciones, permissions]);

  const [selectedIndex, setSelectedIndex] = useState(0);


  // Group items
  const groupedItems = useMemo(() => {
      return filteredResults.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {});
  }, [filteredResults]);

  // Reset selection on query change
  useEffect(() => setSelectedIndex(0), [filteredResults]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        router.push(filteredResults[selectedIndex].path);
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) {
    if (props.trigger) {
        return <div onClick={() => setIsOpen(true)}>{props.trigger}</div>;
    }
    return (
      <button onClick={() => setIsOpen(true)} className="global-search-trigger">
        <i className="fas fa-search" style={{ fontSize: '18px' }}></i>
        <span className="hide-mobile">Buscar...</span>
        <kbd className="hide-mobile">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="global-search-modal">
      <div className="global-search-overlay" onClick={() => setIsOpen(false)} />
      <div className="global-search-content">
        <div className="global-search-input-wrap">
          <i className="fas fa-search" style={{ fontSize: '20px', color: '#666' }}></i>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar operaciones, conductores, vehículos..."
            autoFocus
            className="global-search-input"
          />
          {query && <button onClick={() => setQuery('')} style={{border:'none',background:'none',cursor:'pointer',color:'#999'}}><i className="fa fa-times"></i></button>}
        </div>
        
        <div className="global-search-results">
          {query.length < 2 ? (
             <div className="global-search-hint">
                 <p>Escribe al menos 2 caracteres para buscar.</p>
                 <div style={{marginTop:'15px', textAlign:'left'}}>
                     <small style={{color:'#999', display:'block', marginBottom:'5px'}}>Puedes buscar por:</small>
                     <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                         {['Nombre Cliente', 'Placa', 'Cédula', 'ID Operación'].map(tag => (
                             <span key={tag} style={{background:'#f0f0f0', padding:'4px 8px', borderRadius:'4px', fontSize:'11px', color:'#666'}}>{tag}</span>
                         ))}
                     </div>
                 </div>
             </div>
          ) : filteredResults.length > 0 ? (
            <div className="results-list">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="search-group">
                  <h4>{category} ({items.length})</h4>
                  <ul>
                    {items.map((item) => {
                      const isSelected = filteredResults[selectedIndex] === item;
                      return (
                        <li 
                            key={item.id} 
                            onClick={() => { 
                                if (item.path && item.path !== '#') {
                                    router.push(item.path); 
                                    setIsOpen(false);
                                } else {
                                    console.warn('Ruta inválida para:', item.name);
                                }
                            }}
                            className={isSelected ? 'selected' : ''}
                            style={{ cursor: (item.path && item.path !== '#') ? 'pointer' : 'not-allowed', opacity: (item.path && item.path !== '#') ? 1 : 0.6 }}
                        >
                          <div className="result-icon">
                              {category === 'NAVEGACIÓN' && <i className="fa fa-compass"></i>}
                              {category === 'OPERACIONES' && <i className="fa fa-box"></i>}
                              {category === 'CONDUCTORES' && <i className="fa fa-user"></i>}
                              {category === 'VEHÍCULOS' && <i className="fa fa-truck"></i>}
                              {category === 'CLIENTES' && <i className="fa fa-building"></i>}
                          </div>
                          <div className="result-info">
                              <span className="result-name">{item.name}</span>
                              <span className="result-meta">{item.meta}</span>
                          </div>
                          {isSelected && <i className="fa fa-level-down-alt return-icon"></i>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
             <div className="global-search-hint">
                 <p>No se encontraron resultados para "{query}"</p>
                 <p style={{fontSize:'12px', marginTop:'5px'}}>Intenta con otros términos.</p>
             </div>
          )}
        </div>
        <div className="search-footer">
            <span><kbd>↑</kbd> <kbd>↓</kbd> para navegar</span>
            <span><kbd>Enter</kbd> para seleccionar</span>
            <span><kbd>Esc</kbd> para cerrar</span>
        </div>
      </div>
      <style jsx>{`
        .global-search-trigger {
            background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.1); padding: 8px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; color: #555; font-size: 14px; transition: all 0.2s;
        }
        .global-search-trigger:hover { background: rgba(0,0,0,0.08); color: #000; }
        .global-search-trigger kbd { background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid #ccc; font-size: 11px; font-family: monospace; }
        
        .global-search-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; display: flex; justify-content: center; padding-top: 10vh; }
        .global-search-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); animation: fadeIn 0.2s; }
        .global-search-content { position: relative; width: 100%; max-width: 600px; background: #fff; borderRadius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); overflow: hidden; display: flex; flex-direction: column; max-height: 70vh; animation: slideDown 0.2s; }
        
        .global-search-input-wrap { display: flex; align-items: center; padding: 15px 20px; border-bottom: 1px solid #eee; gap: 15px; }
        .global-search-input { border: none; font-size: 16px; width: 100%; outline: none; color: #333; }
        
        .global-search-results { flex: 1; overflow-y: auto; padding: 10px 0; }
        .global-search-hint { padding: 30px; text-align: center; color: #888; }
        
        .search-group h4 { padding: 8px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #999; margin: 0; background: #fafafa; border-bottom: 1px solid #eee; border-top: 1px solid #eee; }
        .search-group:first-child h4 { border-top: none; }
        .search-group ul { list-style: none; padding: 0; margin: 0; }
        .search-group li { padding: 10px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-bottom: 1px solid #f9f9f9; transition: background 0.1s; }
        .search-group li.selected { background: #e3f2fd; }
        .result-icon { width: 32px; height: 32px; background: #f0f4f8; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #546e7a; flex-shrink: 0; }
        .result-info { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .result-name { font-weight: 500; font-size: 14px; color: #333; }
        .result-meta { font-size: 11px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .return-icon { font-size: 12px; color: #1565c0; }

        .search-footer { padding: 8px 20px; background: #f9f9f9; border-top: 1px solid #eee; display: flex; gap: 15px; font-size: 11px; color: #888; }
        .search-footer kbd { background: #fff; padding: 1px 4px; border: 1px solid #ddd; border-radius: 3px; font-family: monospace; }

        @media (max-width: 600px) {
            .hide-mobile { display: none; }
            .global-search-modal { padding-top: 0; }
            .global-search-content { height: 100%; border-radius: 0; max-height: 100vh; }
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
