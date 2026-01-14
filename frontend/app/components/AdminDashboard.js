'use client';

import { AdminKPIs } from '../components/KPICard';
import { BarChart3, TrendingUp, Users, Bell } from 'lucide-react';

/**
 * Dashboard personalizado para administradores
 * Muestra métricas globales, gráficos y accesos rápidos
 */
export default function AdminDashboard({ userData }) {
  // Datos mock - reemplazar con API real
  const dashboardData = {
    totalUsuarios: 125,
    operacionesActivas: 34,
    totalClientes: 18,
    totalVehiculos: 42,
    alertas: [
      { id: 1, tipo: 'warning', mensaje: '5 operaciones pendientes de asignación', fecha: 'Hace 2h' },
      { id: 2, tipo: 'info', mensaje: '3 usuarios nuevos registrados', fecha: 'Hace 5h' },
    ],
    actividadReciente: [
      { id: 1, usuario: 'Juan Pérez', accion: 'Completó operación #234', fecha: 'Hace 30min' },
      { id: 2, usuario: 'María López', accion: 'Creó cliente nuevo', fecha: 'Hace 1h' },
      { id: 3, usuario: 'Carlos Ruiz', accion: 'Actualizó vehículo ABC123', fecha: 'Hace 2h' },
    ],
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Panel de Administración</h1>
          <p className="dashboard-subtitle">
            Bienvenido, {userData?.username || 'Admin'}
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="btn-secondary">
            <BarChart3 size={18} />
            Reportes
          </button>
          <button className="btn-primary">
            <Users size={18} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* KPIs */}
      <AdminKPIs data={dashboardData} />

      {/* Grid de secciones */}
      <div className="dashboard-grid">
        {/* Alertas */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>
              <Bell size={20} />
              Alertas del Sistema
            </h2>
          </div>
          <div className="alert-list">
            {dashboardData.alertas.map(alerta => (
              <div key={alerta.id} className={`alert-item alert-${alerta.tipo}`}>
                <div className="alert-content">
                  <p>{alerta.mensaje}</p>
                  <span className="alert-time">{alerta.fecha}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>
              <TrendingUp size={20} />
              Actividad Reciente
            </h2>
          </div>
          <div className="activity-list">
            {dashboardData.actividadReciente.map(item => (
              <div key={item.id} className="activity-item">
                <div className="activity-avatar">
                  {item.usuario.charAt(0)}
                </div>
                <div className="activity-content">
                  <p>
                    <strong>{item.usuario}</strong> {item.accion}
                  </p>
                  <span className="activity-time">{item.fecha}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="quick-actions-section">
        <h2>Accesos Rápidos</h2>
        <div className="quick-actions-grid">
          <QuickActionCard
            icon="👥"
            title="Gestionar Usuarios"
            description="Ver, crear y editar usuarios"
            href="/usuarios"
          />
          <QuickActionCard
            icon="🏢"
            title="Gestionar Clientes"
            description="Administrar clientes activos"
            href="/clientes"
          />
          <QuickActionCard
            icon="🚛"
            title="Gestionar Vehículos"
            description="Ver y actualizar vehículos"
            href="/vehiculos"
          />
          <QuickActionCard
            icon="📊"
            title="Ver Reportes"
            description="Reportes y estadísticas"
            href="/reportes"
          />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, description, href }) {
  return (
    <a href={href} className="quick-action-card">
      <div className="quick-action-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </a>
  );
}
