'use client';

import { useState } from 'react';
import { BarChart as BarIcon, LineChart as LineIcon, PieChart as PieIcon } from 'lucide-react';

/**
 * Componente de gráficos mock (ready para Recharts)
 * Muestra visualizaciones de datos
 */
export default function ChartComponent({ data, type = 'bar', title }) {
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      
      <div className="chart-placeholder">
        {type === 'bar' && <BarIcon size={48} />}
        {type === 'line' && <LineIcon size={48} />}
        {type === 'pie' && <PieIcon size={48} />}
        <p>Gráfico {type}</p>
        <p className="chart-hint">Integrar Recharts para visualización real</p>
      </div>

      {/* Datos en tabla como fallback */}
      <div className="chart-data-table">
        <table>
          <thead>
            <tr>
              {Object.keys(data[0] || {}).map(key => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td key={j}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Componente específico para KPI charts
export function KPIChart({ value, label, trend, trendValue }) {
  return (
    <div className="kpi-chart">
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {trend && (
        <div className={`kpi-trend ${trend}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </div>
      )}
    </div>
  );
}

/*
Instalación Recharts:
npm install recharts

Ejemplo con Recharts:
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

<BarChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="value" fill="#1976d2" />
</BarChart>
*/
