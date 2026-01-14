'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function TabConsultas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [searched, setSearched] = useState(false);
  
  // Details Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState(null);
  
  // Details Pagination & Search
  const [detailsSearch, setDetailsSearch] = useState('');
  const [detailsPage, setDetailsPage] = useState(1);
  const [detailsPerPage, setDetailsPerPage] = useState(10);

  // Filters
  const [filters, setFilters] = useState({
    plan_type: '',
    cliente: '',
    placa: '',
    usuario: '',
    carga: '',
    fecha_desde: '',
    fecha_hasta: '',
  });

  // Pagination & Sort
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [internalSearch, setInternalSearch] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost/api/operations/stats/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setStats(await response.json());
      }
    } catch (error) {
      console.error('Error stats:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setCurrentPage(1);
    try {
      const token = localStorage.getItem('access_token');
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) queryParams.append(key, val);
      });

      const response = await fetch(
        `http://localhost/api/operations/delivery-plans/?${queryParams}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        setData(await response.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      plan_type: '',
      cliente: '',
      placa: '',
      usuario: '',
      carga: '',
      fecha_desde: '',
      fecha_hasta: '',
    });
    setSearched(false);
    setData([]);
  };

  // View Details Handler
  const handleViewDetails = async (row) => {
      setSelectedHeader(row);
      setLoadingDetails(true);
      setShowModal(true);
      setDetailsPage(1);
      setDetailsSearch('');
      try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`http://localhost/api/operations/delivery-plans/${row.raw_id ? `N-${row.raw_id}` : row.id}/details/`, {
             headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
              setSelectedDetails(await res.json());
          }
      } catch (e) {
          console.error("Error details", e);
      } finally {
          setLoadingDetails(false);
      }
  };

  // Export Logic: Two Sheets
  const exportToExcel = async () => {
    const token = localStorage.getItem('access_token');
    
    // 1. Prepare Headers Sheet (from current filtered/sorted data)
    const wsHeaders = XLSX.utils.json_to_sheet(sortedData);
    
    // 2. Fetch Details for these filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) queryParams.append(key, val);
    });

    let detailsData = [];
    try {
        const res = await fetch(`http://localhost/api/operations/delivery-plans/export-details/?${queryParams}`, {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            detailsData = await res.json();
        }
    } catch (e) {
        console.error("Error fetching export details", e);
    }

    const wsDetails = XLSX.utils.json_to_sheet(detailsData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsHeaders, "Encabezados");
    XLSX.utils.book_append_sheet(wb, wsDetails, "Detalles");
    
    XLSX.writeFile(wb, `Consulta_Logistica_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Internal Logic (Sort, Filter, Paginate)
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val || '').toLowerCase().includes(internalSearch.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key] || '';
    const valB = b[sortConfig.key] || '';
    
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = itemsPerPage === 'all' ? sortedData : sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(sortedData.length / itemsPerPage);

  // Helper for Details Pagination
  const getFilteredDetails = () => {
      if (!detailsSearch) return selectedDetails;
      return selectedDetails.filter(d => 
        Object.values(d).some(v => String(v || '').toLowerCase().includes(detailsSearch.toLowerCase()))
      );
  };
  const filteredDetails = getFilteredDetails();
  const indexLastDetail = detailsPage * (detailsPerPage === 'all' ? filteredDetails.length : detailsPerPage);
  const indexFirstDetail = indexLastDetail - (detailsPerPage === 'all' ? filteredDetails.length : detailsPerPage);
  const currentDetails = detailsPerPage === 'all' ? filteredDetails : filteredDetails.slice(indexFirstDetail, indexLastDetail);
  const totalDetailPages = detailsPerPage === 'all' ? 1 : Math.ceil(filteredDetails.length / detailsPerPage);

  // Format Date Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // dateStr usually ISO from backend
    return new Date(dateStr).toLocaleString('es-CO');
  };

  return (
    <div className="tab-consultas-container">
      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="icon">📦</div>
            <div>
              <h3>{stats.total_plans}</h3>
              <p>Total Registros</p>
            </div>
          </div>
          <div className="stat-card normal">
             <div className="icon">📄</div>
             <div>
               <h3>{stats.total_plan_normal}</h3>
               <p>Plan Normal</p>
               <small>Último: {formatDate(stats.last_normal_date)}</small>
             </div>
          </div>
          <div className="stat-card r-plan">
             <div className="icon">📋</div>
             <div>
               <h3>{stats.total_plan_r}</h3>
               <p>Plan R</p>
               <small>Último: {formatDate(stats.last_r_date)}</small>
             </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-box">
        <h3>🔍 Configuración de Búsqueda</h3>
        <div className="filters-row">
          <div className="f-group">
            <label>Tipo Plan</label>
            <select 
              value={filters.plan_type} 
              onChange={e => setFilters({...filters, plan_type: e.target.value})}
            >
              <option value="">Todos</option>
              <option value="PLAN_NORMAL">Plan Normal</option>
              <option value="PLAN_R">Plan R</option>
            </select>
          </div>
          <div className="f-group">
            <label>Fechas (Desde - Hasta)</label>
            <div style={{display:'flex', gap:'5px'}}>
              <input type="date" value={filters.fecha_desde} onChange={e => setFilters({...filters, fecha_desde: e.target.value})} />
              <input type="date" value={filters.fecha_hasta} onChange={e => setFilters({...filters, fecha_hasta: e.target.value})} />
            </div>
          </div>
          <div className="f-group">
            <label>Usuario Carga</label>
            <input type="text" placeholder="Ej. admin" value={filters.usuario} onChange={e => setFilters({...filters, usuario: e.target.value})} />
          </div>
        </div>
        <div className="filters-row">
          <div className="f-group">
            <label>Cliente / UN</label>
            <input type="text" placeholder="Código o Nombre" value={filters.cliente} onChange={e => setFilters({...filters, cliente: e.target.value})} />
          </div>
          <div className="f-group">
            <label>Placa / Vehículo</label>
            <input type="text" placeholder="Ej. ABC-123" value={filters.placa} onChange={e => setFilters({...filters, placa: e.target.value})} />
          </div>
          <div className="f-group">
            <label>Carga / Doc Transp</label>
            <input type="text" placeholder="ID Carga" value={filters.carga} onChange={e => setFilters({...filters, carga: e.target.value})} />
          </div>
          
          <div className="f-actions">
            <button className="btn-search" onClick={handleSearch}>Buscar Datos</button>
            <button className="btn-reset" onClick={handleReset}>Limpiar</button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {searched && (
        <div className="results-section">
          <div className="results-header">
             <div className="left-controls">
                <select value={itemsPerPage} onChange={e => {setItemsPerPage(e.target.value === 'all'? 'all': Number(e.target.value)); setCurrentPage(1);}}>
                   <option value={10}>10 filas</option>
                   <option value={20}>20 filas</option>
                   <option value={50}>50 filas</option>
                   <option value="all">Todas</option>
                </select>
                <input 
                  type="text" 
                  placeholder="🔎 Filtrar en resultados..." 
                  value={internalSearch}
                  onChange={e => {setInternalSearch(e.target.value); setCurrentPage(1);}}
                />
             </div>
             <button className="btn-excel" onClick={exportToExcel} disabled={loadingDetails}>📄 Exportar Excel</button>
          </div>

          {loading ? (
             <div className="loading-state">Cargando resultados...</div>
          ) : (
            <div className="table-wrapper">
              <table>
                {/* ... existing table code ... */}
                <thead>
                  <tr>
                    <th>Ver</th>
                    <th onClick={() => handleSort('plan_type')}>Tipo ↕</th>
                    <th onClick={() => handleSort('cliente')}>Cliente/UN ↕</th>
                    <th onClick={() => handleSort('carga')}>Carga ↕</th>
                    <th onClick={() => handleSort('placa')}>Placa ↕</th>
                    <th onClick={() => handleSort('direccion')}>Dirección ↕</th>
                    <th onClick={() => handleSort('estado')}>Estado ↕</th>
                    <th onClick={() => handleSort('usuario_carge')}>Usuario ↕</th>
                    <th onClick={() => handleSort('fecha_carge')}>Fecha ↕</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((row, i) => (
                    <tr key={i}>
                      <td style={{textAlign:'center'}}>
                          {row.plan_type === 'PLAN_NORMAL' && (
                              <button onClick={() => handleViewDetails(row)} className="btn-view-details" title="Ver Detalles">
                                  👁️
                              </button>
                          )}
                      </td>
                      <td data-label="Tipo">
                        <span className={`badge ${row.plan_type === 'PLAN_NORMAL' ? 'badge-normal' : 'badge-r'}`}>
                          {row.plan_type === 'PLAN_NORMAL' ? 'Normal' : 'Plan R'}
                        </span>
                      </td>
                      <td data-label="Cliente/UN">{row.cliente}</td>
                      <td data-label="Carga">{row.carga}</td>
                      <td data-label="Placa">{row.placa}</td>
                      <td data-label="Dirección" title={row.direccion}>{row.direccion ? row.direccion.substring(0,25)+'...' : ''}</td>
                      <td data-label="Estado">
                        <span className={`status-badge ${row.estado === 'Pendiente' ? 'st-pending' : 'st-ok'}`}>
                          {row.estado}
                        </span>
                      </td>
                      <td data-label="Usuario">{row.usuario_carge}</td>
                      <td data-label="Fecha">{formatDate(row.fecha_carge)}</td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                    <tr><td colSpan="11" style={{textAlign:'center', padding:'20px'}}>No se encontraron datos</td></tr>
                  )}
                </tbody>
              </table>
              
              <div className="pagination-container">
                  <div className="showing-text">
                      Mostrando {currentItems.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, sortedData.length)} de {sortedData.length} registros
                  </div>
                  {itemsPerPage !== 'all' && totalPages > 1 && (
                    <div className="pagination">
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)}>❮</button>
                      <span>{currentPage} / {totalPages}</span>
                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)}>❯</button>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showModal && (
          <div className="modal-overlay">
              <div className="modal-content details-modal">
                  {/* ... existing modal code ... */}
                  <div className="modal-header">
                      <h3>Detalle de Carga: {selectedHeader?.carga || selectedHeader?.nombre_ref}</h3>
                      <button onClick={() => setShowModal(false)} className="close-btn">✖</button>
                  </div>
                  
                  <div className="modal-info-box">
                      <div className="info-item"><strong>Carga:</strong> {selectedHeader?.carga}</div>
                      <div className="info-item"><strong>Cliente:</strong> {selectedHeader?.cliente}</div>
                      <div className="info-item"><strong>Placa:</strong> {selectedHeader?.placa}</div>
                      <div className="info-item"><strong>Fecha:</strong> {formatDate(selectedHeader?.fecha_carge)}</div>
                  </div>

                  <div className="modal-controls">
                      <select 
                        value={detailsPerPage} 
                        onChange={e => {setDetailsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value)); setDetailsPage(1);}}
                        className="details-per-page-select"
                      >
                         <option value={5}>5 filas</option>
                         <option value={10}>10 filas</option>
                         <option value={20}>20 filas</option>
                         <option value={50}>50 filas</option>
                         <option value="all">Todas</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="🔎 Buscar en detalles..." 
                        className="details-search-input"
                        value={detailsSearch}
                        onChange={(e) => {setDetailsSearch(e.target.value); setDetailsPage(1);}}
                      />
                  </div>

                  <div className="modal-body">
                      {loadingDetails ? (
                          <div style={{textAlign:'center', padding:'20px'}}>Cargando detalles...</div>
                      ) : (
                          <div className="table-wrapper">
                              <table>
                                  <thead>
                                      <tr>
                                          <th>Artículo (Cód)</th>
                                          <th>Descripción</th>
                                          <th>Cant. Env</th>
                                          <th>Total Vol</th>
                                          <th>UM</th>
                                          <th>Volumen</th>
                                          <th>Remisión</th>
                                          <th>N° Pedido</th>
                                          <th>Origen</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {currentDetails.map((d, k) => (
                                          <tr key={k}>
                                              <td>{d.articulo}</td>
                                              <td>{d.nombre_articulo || 'S/I'}</td>
                                              <td>{d.cant_env}</td>
                                              <td>{d.total_volume}</td>
                                              <td>{d.um}</td>
                                              <td>{d.volumen}</td>
                                              <td>{d.remision}</td>
                                              <td>{d.n_ped}</td>
                                              <td>{d.origen}</td>
                                          </tr>
                                      ))}
                                      {currentDetails.length === 0 && (
                                          <tr><td colSpan="8" style={{textAlign:'center'}}>No hay detalles encontrados</td></tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      )}
                  </div>
                  
                  {/* Modal Pagination */}
                  <div className="pagination-container">
                       <div className="showing-text">
                          Mostrando {currentDetails.length > 0 ? indexFirstDetail + 1 : 0} - {Math.min(indexLastDetail, filteredDetails.length)} de {filteredDetails.length} ítems
                       </div>
                      {totalDetailPages > 1 && (
                          <div className="pagination modal-pagination">
                              <button disabled={detailsPage === 1} onClick={() => setDetailsPage(p => p-1)}>❮</button>
                              <span>{detailsPage} / {totalDetailPages}</span>
                              <button disabled={detailsPage === totalDetailPages} onClick={() => setDetailsPage(p => p+1)}>❯</button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      <style jsx>{`
        /* ... styles ... */
        .pagination-container { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; }
        .showing-text { font-size: 0.9em; color: #666; }
        /* ... existing styles ... */

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 20px; }
        .stat-card { background: white; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); color: #333; }
        .stat-card h3 { margin: 0; font-size: 1.8rem; color: #333; }
        .stat-card p { margin: 0; color: #666; }
        .stat-card small { font-size: 0.7rem; color: #888; display: block; margin-top: 4px; color: #555; }
        .stat-card.total { border-left: 4px solid #6c5ce7; }
        .stat-card.normal { border-left: 4px solid #00b894; }
        .stat-card.r-plan { border-left: 4px solid #0984e3; }
        .icon { font-size: 2rem; }

        .filters-box { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .filters-row { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 15px; align-items: flex-end; }
        .f-group { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 150px; }
        .f-group input, .f-group select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .f-actions { display: flex; gap: 10px; align-items: flex-end; }
        
        .btn-search { background: #007bff; color: white; padding: 8px 20px; border: none; border-radius: 4px; cursor: pointer; height: 38px;}
        .btn-reset { background: #e0e0e0; color: #333; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; height: 38px;}
        .btn-excel { background: #21a979; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-view-details { background: transparent; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; padding: 5px; }
        .btn-view-details:hover { background: #f0f0f0; }

        .results-section { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .results-header { display: flex; justify-content: space-between; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
        .left-controls { display: flex; gap: 10px; }
        
        .table-wrapper { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 900px; }
        th { text-align: left; padding: 12px; background: #f8f9fa; border-bottom: 2px solid #eee; cursor: pointer; white-space: nowrap; }
        td { padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9em; }
        
        .pagination { display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 15px; }
        .pagination button { padding: 5px 15px; cursor: pointer; }

        .badge-normal { background: #e3f9e5; color: #1e7e34; padding: 2px 8px; border-radius: 10px; font-size: 0.8em; }
        .badge-r { background: #e7f5ff; color: #004085; padding: 2px 8px; border-radius: 10px; font-size: 0.8em; }
        .status-badge { padding: 2px 8px; border-radius: 4px; font-size: 0.85em; }
        .st-pending { background: #fff3cd; color: #856404; }
        .st-ok { background: #d4edda; color: #155724; }
        .st-ok { background: #d4edda; color: #155724; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 999; }
        .details-modal { width: 80%; max-width: 900px; max-height: 80vh; background: white; padding: 20px; border-radius: 8px; display: flex; flex-direction: column; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .close-btn { 
            background: #ff4d4d; 
            color: white; 
            border: none; 
            font-size: 1.2rem; 
            cursor: pointer; 
            width: 32px; 
            height: 32px; 
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        .close-btn:hover { background: #cc0000; }
        .modal-body { overflow-y: auto; flex: 1; }
        
        .modal-info-box { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px; font-size: 0.95em; }
        .modal-controls { margin-bottom: 15px; display: flex; gap: 10px; }
        .details-per-page-select { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .details-search-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; flex: 1; }
        .modal-pagination { margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px; }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr; }
          .filters-row { flex-direction: column; align-items: stretch; }
          .f-group { min-width: 100%; }
          .results-header { flex-direction: column; align-items: stretch; gap: 10px; }
          .left-controls { flex-direction: column; width: 100%; }
          .left-controls input { width: 100%; }
          .btn-search, .btn-reset, .btn-excel { width: 100%; margin-top: 5px; }
          .f-actions { flex-direction: column; }
          
          /* Mobile Card View for Table */
          thead { display: none; }
          table, tbody, tr, td { display: block; width: 100%; }
          .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .table-wrapper {
             max-height: 60vh;
             overflow-y: auto;
             border: 1px solid #eee;
             border-radius: 4px;
          }
          tr {
            margin-bottom: 15px;
            background: white;
            color: #333; /* Force dark text on white card */
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            padding: 10px;
          }
          td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            text-align: right;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          td:last-child { border-bottom: none; }
          td::before {
            content: attr(data-label);
            font-weight: bold;
            color: #555;
            text-align: left;
            margin-right: 15px;
          }
        }
      `}</style>
    </div>
  );
}
