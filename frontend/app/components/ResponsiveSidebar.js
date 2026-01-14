'use client';

import { useState } from 'react';
import Menu from './Menu';
import ThemeToggle from './ThemeToggle';
import GlobalSearch from './GlobalSearch';

/**
 * Sidebar responsive que se adapta a diferentes tamaños de pantalla
 * 
 * Props:
 * - isDesktop: Boolean - Si es pantalla desktop
 * - isTablet: Boolean - Si es pantalla tablet
 * - isCollapsed: Boolean - Si está colapsado (solo tablet/desktop)
 * - onToggle: Function - Callback para toggle
 */
export default function ResponsiveSidebar({ isDesktop, isTablet, isCollapsed, onToggle }) {
  // En móvil, este componente no se renderiza (usamos MobileMenu en su lugar)
  if (!isDesktop && !isTablet) {
    return null;
  }

  return (
    <aside className={`responsive-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle button (solo en tablet/desktop) */}
      {/* Toggle button (solo en tablet/desktop) */}
      {(isDesktop || isTablet) && (
        <button 
          className="sidebar-toggle-btn" 
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {isCollapsed ? (
            <i className="fa fa-chevron-right" style={{ fontSize: '16px' }}></i>
          ) : (
            <i className="fa fa-chevron-left" style={{ fontSize: '16px' }}></i>
          )}
        </button>
      )}

      {/* Contenido del sidebar */}
      <div className="sidebar-content">
        {!isCollapsed && (
          <>
            <div className="sidebar-logo-section">
              <img src="/milla7.jpg" alt="Milla 7" className="sidebar-logo-img" />
              <span className="sidebar-logo-text">Milla 7</span>
            </div>
            
            {/* Tools Section */}
            <div className="sidebar-tools">
              <GlobalSearch />
            </div>
            
            <Menu isCollapsed={isCollapsed} />
          </>
        )}

        {isCollapsed && (
          <div className="sidebar-collapsed-icon">
            <img src="/milla7.jpg" alt="Milla 7" className="sidebar-logo-img-small" />
          </div>
        )}
      </div>
    </aside>
  );
}
