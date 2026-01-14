'use client';

import { useState } from 'react';
import TabRutaCarga from './TabRutaCarga';
import '../pedidos/styles.css'; // Reuse styles from pedidos for consistency

export default function DespachosPage() {
  const [activeTab, setActiveTab] = useState('ruta');

  return (
    <div className="pedidos-container"> {/* Reuse container class for layout */}
      <div className="pedidos-header">
        <h1>🚚 Gestión de Despachos</h1>
        <p className="subtitle">Planificación de rutas y gestión de despachos</p>
      </div>

      <div className="tabs-wrapper">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === 'ruta' ? 'active' : ''}`}
            onClick={() => setActiveTab('ruta')}
          >
            <span className="tab-icon">🗺️</span>
            <span className="tab-label">Ruta de Carga</span>
          </button>
          
          {/* Future tabs can be added here, e.g. Historial de Despachos */}
        </div>

        <div className="tab-content">
          {activeTab === 'ruta' && <TabRutaCarga />}
        </div>
      </div>
    </div>
  );
}
