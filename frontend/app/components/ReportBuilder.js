'use client';

import { useState } from 'react';
import { Plus, Trash2, BarChart3, LineChart, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Constructor de reportes personalizables
 * Permite crear reportes con métricas y filtros
 */
export default function ReportBuilder() {
  const [reportName, setReportName] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [chartType, setChartType] = useState('bar');

  const availableMetrics = [
    { id: 'ops_completed', label: 'Operaciones Completadas', type: 'number' },
    { id: 'avg_time', label: 'Tiempo Promedio', type: 'duration' },
    { id: 'active_clients', label: 'Clientes Activos', type: 'number' },
    { id: 'total_vehicles', label: 'Total Vehículos', type: 'number' },
    { id: 'revenue', label: 'Ingresos', type: 'currency' },
  ];

  const toggleMetric = (metricId) => {
    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleSave = () => {
    if (!reportName.trim()) {
      toast.error('Ingresa un nombre para el reporte');
      return;
    }
    if (selectedMetrics.length === 0) {
      toast.error('Selecciona al menos una métrica');
      return;
    }

    const report = {
      name: reportName,
      metrics: selectedMetrics,
      chartType,
      createdAt: new Date().toISOString(),
    };

    console.log('Reporte guardado:', report);
    toast.success('Reporte guardado exitosamente');
    // TODO: Guardar en backend
  };

  return (
    <div className="report-builder">
      <div className="builder-header">
        <h2>Constructor de Reportes</h2>
        <p>Crea reportes personalizados con métricas y visualizaciones</p>
      </div>

      {/* Nombre del reporte */}
      <div className="builder-section">
        <label>Nombre del Reporte</label>
        <input
          type="text"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          placeholder="Ej: Reporte Mensual de Operaciones"
          className="builder-input"
        />
      </div>

      {/* Métricas */}
      <div className="builder-section">
        <label>Métricas a Incluir</label>
        <div className="metrics-grid">
          {availableMetrics.map(metric => (
            <div
              key={metric.id}
              className={`metric-card ${selectedMetrics.includes(metric.id) ? 'selected' : ''}`}
              onClick={() => toggleMetric(metric.id)}
            >
              <div className="metric-checkbox">
                {selectedMetrics.includes(metric.id) && '✓'}
              </div>
              <div>
                <div className="metric-label">{metric.label}</div>
                <div className="metric-type">{metric.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tipo de gráfico */}
      <div className="builder-section">
        <label>Tipo de Visualización</label>
        <div className="chart-types">
          <button
            className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
            onClick={() => setChartType('bar')}
          >
            <BarChart3 size={24} />
            <span>Barras</span>
          </button>
          <button
            className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
            onClick={() => setChartType('line')}
          >
            <LineChart size={24} />
            <span>Líneas</span>
          </button>
          <button
            className={`chart-type-btn ${chartType === 'pie' ? 'active' : ''}`}
            onClick={() => setChartType('pie')}
          >
            <PieChart size={24} />
            <span>Circular</span>
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="builder-section">
        <label>Vista Previa</label>
        <div className="report-preview">
          <h3>{reportName || 'Nombre del Reporte'}</h3>
          <p>Métricas seleccionadas: {selectedMetrics.length}</p>
          <p>Tipo de gráfico: {chartType}</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="builder-actions">
        <button className="btn-secondary" onClick={() => {
          setReportName('');
          setSelectedMetrics([]);
          setChartType('bar');
        }}>
          Limpiar
        </button>
        <button className="btn-primary" onClick={handleSave}>
          <Plus size={18} />
          Guardar Reporte
        </button>
      </div>
    </div>
  );
}
