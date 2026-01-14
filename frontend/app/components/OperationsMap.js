'use client';

import { useState } from 'react';
import { MapPin, Navigation, Filter } from 'lucide-react';

/**
 * Componente básico de mapa para operaciones
 * Usa marcadores simples (mock) - Requiere Google Maps API para producción
 */
export default function OperationsMap() {
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [filter, setFilter] = useState('all');

  // Mock data de operaciones con coordenadas
  const operations = [
    {
      id: 1,
      nombre: 'Operación #234',
      cliente: 'Cliente A',
      estado: 'En Proceso',
      lat: 4.6097,
      lng: -74.0817,
      color: '#42A5F5',
    },
    {
      id: 2,
      nombre: 'Operación #235',
      cliente: 'Cliente B',
      estado: 'Completada',
      lat: 4.6351,
      lng: -74.0703,
      color: '#66BB6A',
    },
    {
      id: 3,
      nombre: 'Operación #236',
      cliente: 'Cliente C',
      estado: 'Pendiente',
      lat: 4.5981,
      lng: -74.0758,
      color: '#FFA726',
    },
  ];

  const filteredOps = filter === 'all' 
    ? operations 
    : operations.filter(op => op.estado.toLowerCase().includes(filter));

  return (
    <div className="operations-map-container">
      {/* Controles */}
      <div className="map-controls">
        <div className="map-filters">
          <Filter size={18} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="proceso">En Proceso</option>
            <option value="completada">Completadas</option>
          </select>
        </div>
        <button className="btn-secondary btn-sm">
          <Navigation size={18} />
          Mi Ubicación
        </button>
      </div>

      {/* Mapa (placeholder - requiere Google Maps) */}
      <div className="map-placeholder">
        <div className="map-info">
          <MapPin size={48} />
          <p>Vista de Mapa</p>
          <p className="map-hint">
            Integración con Google Maps API requerida
          </p>
        </div>

        {/* Marcadores simulados */}
        <div className="map-markers-list">
          {filteredOps.map(op => (
            <div
              key={op.id}
              className="map-marker-card"
              onClick={() => setSelectedOperation(op)}
              style={{ borderLeft: `4px solid ${op.color}` }}
            >
              <div className="marker-icon" style={{ background: op.color }}>
                <MapPin size={16} color="white" />
              </div>
              <div>
                <div className="marker-title">{op.nombre}</div>
                <div className="marker-subtitle">{op.cliente}</div>
                <div className="marker-status" style={{ color: op.color }}>
                  {op.estado}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detalle de operación seleccionada */}
      {selectedOperation && (
        <div className="map-detail-panel">
          <h3>{selectedOperation.nombre}</h3>
          <p><strong>Cliente:</strong> {selectedOperation.cliente}</p>
          <p><strong>Estado:</strong> {selectedOperation.estado}</p>
          <p><strong>Coordenadas:</strong> {selectedOperation.lat}, {selectedOperation.lng}</p>
          <button className="btn-primary btn-sm">Ver Detalle</button>
        </div>
      )}
    </div>
  );
}
