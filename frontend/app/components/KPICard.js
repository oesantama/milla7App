'use client';

import { TrendingUp, Users, Package, Truck } from 'lucide-react';

/**
 * Componente de tarjeta KPI reutilizable
 * 
 * Props:
 * - title: string - Título del KPI
 * - value: number/string - Valor principal
 * - change: number - Cambio porcentual (opcional)
 * - icon: component - Icono de lucide-react
 * - color: string - Color del tema
 */
export default function KPICard({ title, value, change, icon: Icon, color = '#1976d2' }) {
  const isPositive = change >= 0;
  
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <div className="kpi-icon" style={{ background: `${color}15`, color }}>
          <Icon size={24} />
        </div>
        {change !== undefined && (
          <div className={`kpi-change ${isPositive ? 'positive' : 'negative'}`}>
            <TrendingUp size={16} style={{ transform: isPositive ? 'none' : 'rotate(180deg)' }} />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div className="kpi-body">
        <div className="kpi-value">{value}</div>
        <div className="kpi-title">{title}</div>
      </div>
    </div>
  );
}

/**
 * Conjunto de KPIs predefinidos para diferentes roles
 */
export function AdminKPIs({ data }) {
  return (
    <div className="kpi-grid">
      <KPICard
        title="Usuarios Activos"
        value={data?.totalUsuarios || 0}
        change={5.2}
        icon={Users}
        color="#42A5F5"
      />
      <KPICard
        title="Operaciones Activas"
        value={data?.operacionesActivas || 0}
        change={-2.1}
        icon={Package}
        color="#66BB6A"
      />
      <KPICard
        title="Clientes"
        value={data?.totalClientes || 0}
        change={8.3}
        icon={Truck}
        color="#FFA726"
      />
      <KPICard
        title="Vehículos"
        value={data?.totalVehiculos || 0}
        icon={Truck}
        color="#AB47BC"
      />
    </div>
  );
}
