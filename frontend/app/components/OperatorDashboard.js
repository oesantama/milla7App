'use client';

import { Package, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * Dashboard para operadores
 * Vista simplificada enfocada en sus operaciones asignadas
 */
export default function OperatorDashboard({ userData }) {
  const operatorData = {
    pendientes: 5,
    enProceso: 3,
    completadas: 12,
    atrasadas: 1,
    operacionesHoy: [
      { id: 1, cliente: 'Cliente A', estado: 'En Proceso', prioridad: 'Alta', hora: '09:00' },
      { id: 2, cliente: 'Cliente B', estado: 'Pendiente', prioridad: 'Media', hora: '11:00' },
      { id: 3, cliente: 'Cliente C', estado: 'Pendiente', prioridad: 'Alta', hora: '14:00' },
    ],
  };

  return (
    <div className="operator-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Mis Operaciones</h1>
          <p className="dashboard-subtitle">
            Bienvenido, {userData?.username || 'Operador'}
          </p>
        </div>
      </div>

      {/* KPIs simplificados */}
      <div className="operator-kpis">
        <div className="operator-kpi" style={{ borderColor: '#FFA726' }}>
          <Clock size={32} color="#FFA726" />
          <div className="kpi-info">
            <div className="kpi-value">{operatorData.pendientes}</div>
            <div className="kpi-label">Pendientes</div>
          </div>
        </div>
        <div className="operator-kpi" style={{ borderColor: '#42A5F5' }}>
          <Package size={32} color="#42A5F5" />
          <div className="kpi-info">
            <div className="kpi-value">{operatorData.enProceso}</div>
            <div className="kpi-label">En Proceso</div>
          </div>
        </div>
        <div className="operator-kpi" style={{ borderColor: '#66BB6A' }}>
          <CheckCircle size={32} color="#66BB6A" />
          <div className="kpi-info">
            <div className="kpi-value">{operatorData.completadas}</div>
            <div className="kpi-label">Completadas Hoy</div>
          </div>
        </div>
        <div className="operator-kpi" style={{ borderColor: '#E53935' }}>
          <AlertTriangle size={32} color="#E53935" />
          <div className="kpi-info">
            <div className="kpi-value">{operatorData.atrasadas}</div>
            <div className="kpi-label">Atrasadas</div>
          </div>
        </div>
      </div>

      {/* Timeline del día */}
      <div className="dashboard-card">
        <h2>Operaciones de Hoy</h2>
        <div className="operations-timeline">
          {operatorData.operacionesHoy.map(op => (
            <div key={op.id} className="timeline-operation">
              <div className="operation-time">{op.hora}</div>
              <div className="operation-details">
                <h3>{op.cliente}</h3>
                <div className="operation-meta">
                  <span className={`badge badge-${op.estado === 'Pendiente' ? 'warning' : 'info'}`}>
                    {op.estado}
                  </span>
                  <span className={`priority priority-${op.prioridad.toLowerCase()}`}>
                    {op.prioridad}
                  </span>
                </div>
              </div>
              <button className="btn-primary btn-sm">Ver Detalle</button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="operator-actions">
        <button className="action-btn action-btn-start">
          <Package size={20} />
          Iniciar Operación
        </button>
        <button className="action-btn action-btn-report">
          <AlertTriangle size={20} />
          Reportar Incidencia
        </button>
      </div>
    </div>
  );
}
