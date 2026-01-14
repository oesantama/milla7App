"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';

export default function TabCargaArchivos() {
  const [xlsFile, setXlsFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [xlsLoading, setXlsLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [xlsResult, setXlsResult] = useState(null);
  const [csvResult, setCsvResult] = useState(null);

  // New State for Preview Modal
  const [showPreview, setShowPreview] = useState(false);
  const [activePlanType, setActivePlanType] = useState('PLAN_NORMAL'); // 'PLAN_NORMAL' or 'PLAN_R'
  const [previewData, setPreviewData] = useState([]);
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Helper to format Excel serial dates
  const formatCell = (header, value) => {
    // Check if header implies a date (heuristic)
    const isDateColumn = /fecha|date|demanda|petic|ship/i.test(header);
    
    // Check if value is an Excel serial number (approx range for recent years: 40000-50000 <-> 2009-2036)
    if (isDateColumn && typeof value === 'number' && value > 40000 && value < 55000) {
      const date = new Date((value - 25569) * 86400 * 1000); // Convert Excel serial to JS date
      return date.toLocaleDateString('es-ES');
    }
    return value;
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredData = previewData.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Calculate Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = itemsPerPage === 'all' ? sortedData : sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(sortedData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleFileChange = async (event, type) => {
    const file = event.target.files[0];
    if (type === "xls") {
      setXlsFile(file);
      setXlsResult(null);
      if (file) {
        setActivePlanType('PLAN_NORMAL');
        readExcel(file, 'PLAN_NORMAL');
      }
    } else {
      setCsvFile(file);
      setCsvResult(null);
      if (file) {
        setActivePlanType('PLAN_R');
        readExcel(file, 'PLAN_R');
      }
    }
  };

  const readExcel = (file, planType) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Determine range based on Plan Type
      // Plan Normal starts at row 2 (index 1) typically
      // Plan R (CSV) starts at row 1 (index 0)
      const range = planType === 'PLAN_NORMAL' ? 1 : 0;
      console.log(`DEBUG: Plan Type: ${planType}, Range used: ${range}`);
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: range }); 
      
      setPreviewData(jsonData);
      
      if (jsonData.length > 0) {
        // Enriched Headers: Add 'Nota' at the beginning
        const keys = Object.keys(jsonData[0]);
        setPreviewHeaders(['Nota', ...keys]); 

        // Validate Existence
        validateExistence(jsonData, planType);
      }
      
      setShowPreview(true);
      setCurrentPage(1); 
    };
    reader.readAsArrayBuffer(file);
  };
  
  const validateExistence = async (data, planType) => {
      // 1. Extract unique pairs
      const uniquePairs = [];
      const seen = new Set();
      
      data.forEach(row => {
          // Normalize keys depending on Plan Type logic if needed, 
          // but backend expects 'carga' and 'placa'. 
          // Our json data keys might be "Carga " or "Carga" depending on file.
          // Let's normalize row keys first or handle it.
          // The readExcel simple sheet_to_json preserves headers as is.
          
          // Helper to find key case-insensitive
          const findKey = (obj, keyName) => Object.keys(obj).find(k => k.trim().toLowerCase() === keyName.toLowerCase());
          
          const cargaKey = findKey(row, 'Carga');
          const placaKey = findKey(row, 'Placa');
          
          if (cargaKey && placaKey) {
             const c = row[cargaKey];
             const p = row[placaKey];
             const key = `${c}_${p}`;
             if (!seen.has(key)) {
                 seen.add(key);
                 uniquePairs.push({ carga: c, placa: p });
             }
          }
      });
      
      try {
          const token = localStorage.getItem("access_token");
          const res = await fetch('/api/solicitudes/validar-existencia/', {
              method: 'POST',
              headers: { 
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}` 
              },
              body: JSON.stringify(uniquePairs)
          });
          
          if (res.ok) {
              const existingKeys = await res.json(); // List of "Carga_Placa" strings
              const existingSet = new Set(existingKeys);
              
              // Update Preview Data with Status
              const updatedData = data.map(row => {
                  const cargaKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'carga');
                  const placaKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'placa');
                  
                  const c = row[cargaKey];
                  const p = row[placaKey];
                  const key = `${c}_${p}`;
                  
                  const exists = existingSet.has(key);
                  return {
                      Nota: exists ? "L ya existe en base" : "Aprobado para cargar",
                      _isValidToSave: !exists, // Internal flag
                      ...row
                  };
              });
              setPreviewData(updatedData);
          }
      } catch (e) {
          console.error("Validation error", e);
      }
  };

  const handleExportPreview = () => {
    const worksheet = XLSX.utils.json_to_sheet(previewData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Preview");
    XLSX.writeFile(workbook, "Preview_Solicitudes.xlsx");
  };

  const handleSaveData = async () => {
    const endpoint = activePlanType === 'PLAN_R' 
      ? '/api/operations/upload-plan-r/' 
      : '/api/solicitudes/importar/';

    console.log(`Iniciando guardado Plan: ${activePlanType} -> ${endpoint}`);
    setXlsLoading(true);
    
    // Filter only valid rows
    const dataToSave = previewData.filter(row => row._isValidToSave !== false);
    
    if (dataToSave.length === 0) {
        Swal.fire({
            title: 'No hay registros válidos',
            text: 'No hay registros válidos para guardar.',
            icon: 'warning',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#007bff'
        });
        setXlsLoading(false);
        return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSave),
        }
      );
      const data = await response.json();
      if (response.ok) {
        const resultMsg = { success: true, message: data.message };
        if (activePlanType === 'PLAN_R') {
           setCsvResult(resultMsg);
           setCsvFile(null);
        } else {
           setXlsResult(resultMsg);
           setXlsFile(null);
        }
        setShowPreview(false);
      } else {
        const errorMsg = { success: false, message: data.error || "Error saving data" };
        if (activePlanType === 'PLAN_R') setCsvResult(errorMsg);
        else setXlsResult(errorMsg);
      }
    } catch (error) {
      const errorMsg = { success: false, message: error.message };
      if (activePlanType === 'PLAN_R') setCsvResult(errorMsg);
      else setXlsResult(errorMsg);
    } finally {
      setXlsLoading(false);
    }
  };

  // ... keep existing CSV logic ...



  const resetFile = (type) => {
    if (type === "xls") {
      setXlsFile(null);
      setXlsResult(null);
      setShowPreview(false);
      setPreviewData([]);
      setSearchTerm("");
      setCurrentPage(1);
    } else {
      setCsvFile(null);
      setCsvResult(null);
    }
  };

  const renderResult = (result) => {
    if (!result) return null;
    return (
      <div className={`result-box ${result.success ? "success" : "error"}`}>
        <h4>{result.success ? "✅ Éxito" : "❌ Error"}</h4>
        <p>{result.message}</p>
      </div>
    );
  };

  return (
    <div className="tab-carga-container">
      {/* Modal Preview */}
      {showPreview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Vista Previa ({sortedData.length} reg)</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select 
                  className="page-select"
                  value={itemsPerPage} 
                  onChange={(e) => {
                    const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                    setItemsPerPage(val);
                    setCurrentPage(1);
                  }}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value={5}>5 por pág</option>
                  <option value={10}>10 por pág</option>
                  <option value={15}>15 por pág</option>
                  <option value={20}>20 por pág</option>
                  <option value={50}>50 por pág</option>
                  <option value="all">Todos</option>
                </select>
                <input 
                  type="text" 
                  placeholder="🔍 Buscar en tabla..." 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
                />
              </div>
            </div>
            
            <div
              className="table-responsive"
              style={{ maxHeight: "400px", overflow: "auto", minHeight: '200px' }}
            >
              <table>
                <thead>
                  <tr>
                    {previewHeaders.map((h) => (
                      <th 
                        key={h} 
                        onClick={() => handleSort(h)}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        title="Clic para ordenar"
                      >
                        {h} {sortConfig.key === h ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((row, i) => (
                    <tr key={i}>
                      {previewHeaders.map((h) => (
                        <td key={h} data-label={h}>{formatCell(h, row[h])}</td>
                      ))}
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                     <tr>
                      <td colSpan={previewHeaders.length} style={{ textAlign: "center", padding: "20px" }}>
                        No se encontraron resultados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {itemsPerPage !== 'all' && sortedData.length > 0 && (
              <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '15px 0' }}>
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="btn-page"
                >
                  ❮ Anterior
                </button>
                <span style={{ alignSelf: 'center', fontSize: '0.9em' }}>
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="btn-page"
                >
                  Siguiente ❯
                </button>
              </div>
            )}


            {/* Loading Overlay within Modal */}
            {xlsLoading && (
              <div className="loading-overlay">
                <div className="spinner-container">
                  <div className="spinner"></div>
                  <p>Guardando datos, por favor espere...</p>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button onClick={handleExportPreview} className="btn-secondary">
                Exportar Excel
              </button>
              <button
                onClick={handleSaveData}
                className="btn-primary"
                disabled={xlsLoading}
              >
                {xlsLoading ? (
                  <>
                    <span className="sc-spinner"></span> Guardando...
                  </>
                ) : (
                  "Guardar en Base de Datos"
                )}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="btn-danger"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="upload-sections">
        {/* Sección Plan Normal (XLS) */}
        <div className="upload-section">
          <div className="section-header">
            <h3>📄 Plan Normal (XLS/XLSX) - Solicitudes</h3>
            <p className="section-description">
              Carga archivo Excel. Se procesará desde la fila A2.
            </p>
          </div>

          <div className="dropzone">
            <input
              type="file"
              id="xls-file"
              accept=".xls,.xlsx"
              onChange={(e) => handleFileChange(e, "xls")}
              className="file-input"
            />
            <label htmlFor="xls-file" className="file-label">
              {xlsFile ? (
                <div className="file-selected">
                  <span className="file-icon">📎</span>
                  <span className="file-name">{xlsFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      resetFile("xls");
                    }}
                    className="remove-file-btn"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="file-placeholder empty-state-cta">
                  <div className="icon-container">
                    <i className="fa fa-cloud-upload" style={{fontSize:'48px', color:'#007bff'}}></i>
                  </div>
                  <h4>Arrastra tu archivo aquí</h4>
                  <p>o haz clic para explorar</p>
                  <button type="button" className="cta-button" style={{pointerEvents:'none'}}>
                      Seleccionar Archivo
                  </button>
                </div>
              )}
            </label>
          </div>
          {/* Removed Upload Button for XLS as it is auto-triggered or preview-based */}
          {/* If user creates file, preview opens automatically */}

          {renderResult(xlsResult)}
        </div>

        {/* Sección Plan R (CSV) */}
        <div className="upload-section">
          <div className="section-header">
            <h3>📋 Plan R (CSV)</h3>
            <p className="section-description">
              Carga archivos CSV con datos de plan R (delimitador: ;)
            </p>
          </div>

          <div className="dropzone">
            <input
              type="file"
              id="csv-file"
              accept=".csv"
              onChange={(e) => handleFileChange(e, "csv")}
              className="file-input"
            />
            <label htmlFor="csv-file" className="file-label">
              {csvFile ? (
                <div className="file-selected">
                  <span className="file-icon">📎</span>
                  <span className="file-name">{csvFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      resetFile("csv");
                    }}
                    className="remove-file-btn"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="file-placeholder">
                  <span className="upload-icon">⬆️</span>
                  <p>Arrastra un archivo CSV aquí</p>
                  <p className="file-hint">o haz clic para seleccionar</p>
                </div>
              )}
            </label>
          </div>

          {/* Button removed, now uses Preview Modal automatically */}
          {renderResult(csvResult)}
        </div>

        </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 80%;
          max-width: 900px;
        }
        .modal-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .btn-primary {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-danger {
          background: #dc3545;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9em;
        }
        th {
          background: #f8f9fa;
          position: sticky;
          top: 0;
        }
        td,
        th {
          padding: 8px;
          border: 1px solid #dee2e6;
          text-align: left;
        }
        .btn-page {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          color: #007bff;
        }
        .btn-page:disabled {
          color: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }
        .btn-page:hover:not(:disabled) {
          background: #e9ecef;
          border-color: #ced4da;
        }
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 8px;
          z-index: 10;
        }
        .spinner-container {
          text-align: center;
          color: #007bff;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px auto;
        }
        .sc-spinner {
          display: inline-block;
          border: 2px solid #f3f3f3;
          border-top: 2px solid white;
          border-radius: 50%;
          width: 12px;
          height: 12px;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .upload-sections { flex-direction: column; }
          .modal-content { width: 95%; max-height: 90vh; overflow-y: auto; }
          .modal-actions { flex-direction: column; }
          .modal-actions button { width: 100%; }

          /* Mobile Card View for Modal Table */
          thead { display: none; }
          table, tbody, tr, td { display: block; width: 100%; }
          tr {
            margin-bottom: 10px;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 10px;
            background: #fdfdfd;
            color: #333; /* Force dark text */
          }
          td {
            display: flex;
            justify-content: space-between;
            text-align: right;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
            font-size: 0.85em;
          }
          td:last-child { border-bottom: none; }
          td::before {
            content: attr(data-label);
            font-weight: bold;
            color: #666;
            margin-right: 10px;
            text-align: left;
            flex: 1;
          }
          }
        }

        /* P17: Empty State CTA Styles */
        .empty-state-cta {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px;
            text-align: center;
            color: #666;
            transition: all 0.3s ease;
        }
        .empty-state-cta .icon-container {
            margin-bottom: 15px;
            background: #e3f2fd;
            padding: 20px;
            border-radius: 50%;
        }
        .empty-state-cta h4 {
            margin: 0 0 5px 0;
            color: #333;
            font-weight: 600;
        }
        .empty-state-cta p {
            margin: 0 0 20px 0;
            font-size: 0.9em;
            color: #888;
        }
        .empty-state-cta .cta-button {
            padding: 10px 24px;
            background: #1565c0;
            color: white;
            border: none;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
        }
        .dropzone:hover .empty-state-cta .icon-container {
            background: #bbdefb;
            transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
