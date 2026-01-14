'use client';

import { useState } from 'react';
import { Search, X, Calendar, Filter } from 'lucide-react';

/**
 * Componente de filtros avanzados para tablas
 * Soporta búsqueda por texto, multiselect y rangos de fecha
 */
export default function TableFilters({
  onFilterChange,
  searchPlaceholder = 'Buscar...',
  showDateRange = true,
  showStatusFilter = true,
  statusOptions = ['Activo', 'Inactivo'],
  customFilters = [],
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleApplyFilters = () => {
    const filters = {
      search: searchTerm,
      statuses: selectedStatuses,
      dateFrom,
      dateTo,
    };

    // Contar filtros activos
    let count = 0;
    if (searchTerm) count++;
    if (selectedStatuses.length > 0) count++;
    if (dateFrom || dateTo) count++;

    setActiveFiltersCount(count);
    onFilterChange?.(filters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatuses([]);
    setDateFrom('');
    setDateTo('');
    setActiveFiltersCount(0);
    onFilterChange?.({
      search: '',
      statuses: [],
      dateFrom: '',
      dateTo: '',
    });
  };

  const toggleStatus = (status) => {
    setSelectedStatuses(prev => {
      const newStatuses = prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status];
      return newStatuses;
    });
  };

  return (
    <div className="table-filters">
      <div className="filters-header">
        <div className="filters-title">
          <Filter size={20} />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="filters-badge">{activeFiltersCount}</span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button className="btn-clear-filters" onClick={handleClearFilters}>
            <X size={16} />
            Limpiar Filtros
          </button>
        )}
      </div>

      <div className="filters-content">
        {/* Búsqueda por texto */}
        <div className="filter-group">
          <label>Búsqueda</label>
          <div className="search-input-wrapper">
            <Search size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
            />
          </div>
        </div>

        {/* Filtro por estado */}
        {showStatusFilter && (
          <div className="filter-group">
            <label>Estado</label>
            <div className="status-checkboxes">
              {statusOptions.map(status => (
                <label key={status} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => toggleStatus(status)}
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Rango de fechas */}
        {showDateRange && (
          <div className="filter-group">
            <label>Rango de Fechas</label>
            <div className="date-range">
              <div className="date-input-wrapper">
                <Calendar size={16} />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="Desde"
                />
              </div>
              <span className="date-separator">-</span>
              <div className="date-input-wrapper">
                <Calendar size={16} />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="Hasta"
                />
              </div>
            </div>
          </div>
        )}

        {/* Filtros personalizados */}
        {customFilters.map((filter, index) => (
          <div key={index} className="filter-group">
            <label>{filter.label}</label>
            {filter.component}
          </div>
        ))}
      </div>

      <div className="filters-actions">
        <button className="btn-primary" onClick={handleApplyFilters}>
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}

/**
 * Hook para usar filtros en componentes de tabla
 */
export function useTableFilters(data = [], filterFn) {
  const [filters, setFilters] = useState({
    search: '',
    statuses: [],
    dateFrom: '',
    dateTo: '',
  });

  const filteredData = data.filter(item => {
    // Aplicar función de filtro personalizada si existe
    if (filterFn) {
      return filterFn(item, filters);
    }

    // Filtro por defecto
    let matches = true;

    // Búsqueda por texto (busca en todas las propiedades)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      matches = Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.statuses.length > 0 && !filters.statuses.includes(item.estado)) {
      matches = false;
    }

    return matches;
  });

  return {
    filters,
    setFilters,
    filteredData,
  };
}
