'use client';

import { Users, TrendingUp, Clock, Award } from 'lucide-react';

/**
 * Dashboard para supervisores
 * Vista de equipo con métricas de rendimiento y asignaciones
 */
export default function SupervisorDashboard({ userData }) {
  const supervisorData = {
    operadoresActivos: 8,
    operacionesEnCurso: 15,
    tiempoPromedio: '2.5h',
    tasaCompletitud: '94%',
    equipo: [
      { id: 1, nombre: 'Juan Pérez', operaciones: 5, estado: 'Ocupado', rendimiento: 92 },
      { id: 2, nombre: 'María López', operaciones: 3, estado: 'Disponible', rendimiento: 98 },
      { id: 3, nombre: 'Carlos Ruiz', operaciones: 4, estado: 'Ocupado', rendimiento: 88 },
      { id: 4, nombre: 'Ana Torres', operaciones: 2, estado: 'Disponible', rendimiento: 95 },
    ],
  };

  return (
    <div className="supervisor-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Panel de Supervisión</h1>
          <p className="dashboard-subtitle">
            Bienvenido, {userData?.username || 'Supervisor'}
          </p>
        </div>
        <button className="btn-primary">Asignar Operación</button>
      </div>

      {/* KPIs del equipo */}
      <div className="supervisor-kpis">
        <div className="kpi-card-simple">
          <Users size={28} color="#1976d2" />
          <div>
            <div className="kpi-value">{supervisorData.operadoresActivos}</div>
            <div className="kpi-label">Operadores Activos</div>
          </div>
        </div>
        <div className="kpi-card-simple">
          <TrendingUp size={28} color="#66BB6A" />
          <div>
            <div className="kpi-value">{supervisorData.operacionesEnCurso}</div>
            <div className="kpi-label">Operaciones en Curso</div>
          </div>
        </div>
        <div className="kpi-card-simple">
          <Clock size={28} color="#FFA726" />
          <div>
            <div className="kpi-value">{supervisorData.tiempoPromedio}</div>
            <div className="kpi-label">Tiempo Promedio</div>
          </div>
        </div>
        <div className="kpi-card-simple">
          <Award size={28} color="#AB47BC" />
          <div>
            <div className="kpi-value">{supervisorData.tasaCompletitud}</div>
            <div className="kpi-label">Tasa de Completitud</div>
          </div>
        </div>
      </div>

      {/* Tabla de equipo */}
      <div className="dashboard-card">
        <h2>Estado del Equipo</h2>
        <div className="team-table">
          <table>
            <thead>
              <tr>
                <th>Operador</th>
                <th>Operaciones Asignadas</th>
                <th>Estado</th>
                <th>Rendimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {supervisorData.equipo.map(op => (
                <tr key={op.id}>
                  <td>
                    <div className="operator-info">
                      <div className="operator-avatar">{op.nombre.charAt(0)}</div>
                      <span>{op.nombre}</span>
                    </div>
                  </td>
                  <td>{op.operaciones}</td>
                  <td>
                    <span className={`badge badge-${op.estado === 'Disponible' ? 'success' : 'warning'}`}>
                      {op.estado}
                    </span>
                  </td>
                  <td>
                    <div className="performance-bar">
                      <div
                        className="performance-fill"
                        style={{ width: `${op.rendimiento}%`, background: op.rendimiento >= 90 ? '#66BB6A' : '#FFA726' }}
                      />
                      <span>{op.rendimiento}%</span>
                    </div>
                  </td>
                  <td>
                    <button className="btn-sm btn-secondary">Asignar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
