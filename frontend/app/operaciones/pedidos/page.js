'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import TabCargaArchivos from './TabCargaArchivos';
import TabRecibidoMaterial from './TabRecibidoMaterial';
import TabConsultas from './TabConsultas';

import './styles.css';

export default function PedidosPage() {
  const [activeTab, setActiveTab] = useState('carga');

  return (
    <div className="pedidos-container">
      <div className="pedidos-header">
        <h1>📦 Gestión de Pedidos</h1>
        <p className="subtitle">Carga, recepción, consulta y despacho de pedidos</p>
      </div>

      <div className="tabs-wrapper">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === 'carga' ? 'active' : ''}`}
            onClick={() => setActiveTab('carga')}
          >
            <span className="tab-icon">📤</span>
            <span className="tab-label">
              Carga de Archivos
              <span className="info-tooltip" title="Importar nuevos pedidos al sistema desde Excel/CSV.">
                <Info size={14} />
              </span>
            </span>
          </button>
          
          <button
            className={`tab-button ${activeTab === 'recibido' ? 'active' : ''}`}
            onClick={() => setActiveTab('recibido')}
          >
            <span className="tab-icon">📥</span>
            <span className="tab-label">
              Recibido Material
              <span className="info-tooltip" title="Validación ciega de mercancía física vs pedidos.">
                <Info size={14} />
              </span>
            </span>
          </button>

          <button
            className={`tab-button ${activeTab === 'consultas' ? 'active' : ''}`}
            onClick={() => setActiveTab('consultas')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-label">
              Consultas
              <span className="info-tooltip" title="Historial y estado detallado de pedidos procesados.">
                <Info size={14} />
              </span>
            </span>
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'carga' && <TabCargaArchivos />}
          {activeTab === 'recibido' && <TabRecibidoMaterial />}
          {activeTab === 'consultas' && <TabConsultas />}
        </div>
      </div>
      
      <style jsx>{`
        .info-tooltip {
          display: inline-flex;
          align-items: center;
          margin-left: 8px;
          color: #888;
          cursor: help;
          vertical-align: middle;
        }
        .info-tooltip:hover {
          color: #2196F3;
        }
        .tab-label {
            display: flex;
            align-items: center;
        }
      `}</style>
    </div>
  );
}
