'use client';

import { useState, useEffect, useRef } from 'react';
import { exportToExcel } from '../../../utils/exportToExcel';

export default function TabRecibidoMaterial() {
  const [cargas, setCargas] = useState([]);
  const [selectedCarga, setSelectedCarga] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [scanMode, setScanMode] = useState('GENERAL'); // GENERAL (Unit) vs INTERMEDIO (Box)
  const [lastScan, setLastScan] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef(null);

  useEffect(() => {
    fetchCargas();
  }, []);

  const fetchCargas = async () => {
    try {
      const token = localStorage.getItem('access_token');
      // Use relative path
      const res = await fetch('/api/recepcion/cargas-pendientes/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar');
      const data = await res.json();
      setCargas(data);
    } catch (err) {
      console.error(err);
    }
  };



  const [scannedItems, setScannedItems] = useState({}); // { "Name": {total, code} }
  const [searchTerm, setSearchTerm] = useState(''); // New search term state

  // New Effect: Load existing progress when Carga is selected
  useEffect(() => {
    if (!selectedCarga) {
        setScannedItems({});
        return;
    }
    
    const fetchProgress = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`/api/recepcion/progreso/${selectedCarga}/`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setScannedItems(data);
            }
        } catch (e) {
            console.error("Error fetching progress", e);
        }
    };
    fetchProgress();
  }, [selectedCarga]);

  const handleScan = async (e) => {
    if (e.key === 'Enter') {
      const code = barcode.trim();
      if (!code || !selectedCarga) return;

      setLoading(true);
      setError(null);
      setLastScan(null);

      try {
        const token = localStorage.getItem('access_token');
        
        // DIRECT CALL TO PROCESS ITEM (Validation is now on backend against MANIFEST)
        // We do not search globally first. This avoids 404 for items not in master.
        
        const resProcess = await fetch('/api/recepcion/procesar-item/', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            carga_id: selectedCarga,
            code: code, // Send CODE directly
            cantidad: 1, 
            unidad_seleccionada: scanMode
          })
        });

        if (!resProcess.ok) {
           const errData = await resProcess.json();
           throw new Error(errData.error || 'Error al procesar');
        }

        const dataProcess = await resProcess.json();
        
        setLastScan({
          nombre: dataProcess.nombre,
          total: dataProcess.nuevo_total,
          unidad: scanMode === 'INTERMEDIO' ? 'CAJA' : 'UNIDAD'
        });
        
        setScannedItems(prev => ({
            ...prev,
            [dataProcess.nombre]: { total: dataProcess.nuevo_total, code: code }
        }));
        
        setBarcode(''); // Clear
        
      } catch (err) {
        setError(err.message);
        // Play error sound?
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  const [validationResult, setValidationResult] = useState(null); // { status, novedades }


  const handleRemoveOne = async (nombre, itemData) => {
    if (!itemData || itemData.total <= 0) return;
    
    setLoading(true);
    try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('/api/recepcion/procesar-item/', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            carga_id: selectedCarga,
            code: itemData.code, 
            cantidad: -1, 
            unidad_seleccionada: scanMode 
          })
        });

        if (!res.ok) {
           const errData = await res.json();
           throw new Error(errData.error || 'Error al restar');
        }

        const dataProcess = await res.json();
        
        setScannedItems(prev => ({
            ...prev,
            [dataProcess.nombre]: { ...prev[dataProcess.nombre], total: dataProcess.nuevo_total }
        }));
        
    } catch (err) {
        alert(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleValidate = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('/api/recepcion/validar-carga/', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            carga_id: selectedCarga
          })
        });

        const data = await res.json();
        
        if (data.status === 'retry') {
            setValidationResult({
                type: 'error',
                title: '⚠️ Diferencias Detectadas (Intento 1)',
                message: 'Se encontraron inconsistencias. Por favor verifique los siguientes ítems:',
                items: data.novedades
            });
        } else if (data.status === 'ok') {
            setValidationResult({
                type: 'success',
                title: '✅ Recepción Finalizada',
                message: data.message || 'La carga se ha validado correctamente.'
            });
            // Refresh list
            fetchCargas();
            setSelectedCarga(null);
            setScannedItems({}); // Clear table
        } else {
             alert("Estado desconocido: " + JSON.stringify(data));
        }

      } catch (err) {
        alert("Error validando: " + err.message);
      } finally {
        setLoading(false);
      }
  };

  const closeValidationModal = () => setValidationResult(null);

  const currentCargaInfo = cargas.find(c => c.id == selectedCarga);

  return (
    <div className="tab-recibido">
      {/* Validation Modal */}
      {validationResult && (
        <div className="modal-overlay">
            <div className={`modal-content ${validationResult.type}`}>
                <h3>{validationResult.title}</h3>
                <p>{validationResult.message}</p>
                
                {validationResult.items && (
                    <ul className="novedades-list">
                        {validationResult.items.map((it, idx) => (
                            <li key={idx}>{it.articulo}: {it.mensaje}</li>
                        ))}
                    </ul>
                )}
                
                <button onClick={closeValidationModal}>Aceptar / Reintentar</button>
            </div>
        </div>
      )}

      <div className="toolbar">
        <div className="form-group">
          <label>Seleccionar L Pendiente:</label>
          <select 
            value={selectedCarga || ''} 
            onChange={(e) => setSelectedCarga(e.target.value)}
            className="carga-select"
          >
            <option value="">-- Seleccione --</option>
            {cargas.map(c => (
              <option key={c.id} value={c.id}>
                {c.placa} - {c.carga} ({c.estado_recepcion})
              </option>
            ))}
          </select>
        </div>
        
        {selectedCarga && (
            <div className="mode-switch">
                <span className="label">Modo Escaneo:</span>
                <div className="switch-container">
                    <button 
                        className={`mode-btn ${scanMode === 'GENERAL' ? 'active unit' : ''}`}
                        onClick={() => setScanMode('GENERAL')}
                    >
                        UNIDAD (1x)
                    </button>
                    <button 
                        className={`mode-btn ${scanMode === 'INTERMEDIO' ? 'active box' : ''}`}
                        onClick={() => setScanMode('INTERMEDIO')}
                    >
                        CAJA / BULTO
                    </button>
                </div>
            </div>
        )}
      </div>

      {currentCargaInfo && (
          <div className="carga-details-container">
            <div className="info-card">
                <h4>📋 Información de Carga</h4>
                <p><strong>Carga ID:</strong> {currentCargaInfo.carga}</p>
                <p><strong>Placa:</strong> {currentCargaInfo.placa}</p>
                <p><strong>Fecha:</strong> {new Date(currentCargaInfo.fecha).toLocaleString()}</p>
                {currentCargaInfo.observaciones && <p><strong>Obs:</strong> {currentCargaInfo.observaciones}</p>}
                <div style={{marginTop: '10px', background: '#e3f2fd', padding: '10px', borderRadius:'4px', fontSize:'0.9em'}}>
                    ℹ️ <strong>Modo Ciego:</strong> Las cantidades esperadas están ocultas. Escanee todos los artículos para validar.
                </div>
            </div>

            {/* BLIND MODE: Do NOT show expected details. Show Scanned Summary instead. */}
            
             <div className="scan-area">
                 <h3>Escaneo para Carga</h3>
                 
                 <div className="input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyDown={handleScan}
                        placeholder="Pistolear código aquí..."
                        disabled={loading}
                        autoFocus
                    />
                    {loading && <span className="spinner">⌛</span>}
                 </div>
    
                 {error && <div className="scan-error">❌ {error}</div>}
                 
                 {lastScan && (
                     <div className="scan-success">
                         <span className="icon">✅</span>
                         <div className="details">
                             <strong>{lastScan.nombre}</strong>
                             <p>Agregado: 1 {lastScan.unidad} | Total Acum: {lastScan.total}</p>
                         </div>
                     </div>
                 )}
    
                 <div className="actions">
                     <button className="btn-validate" onClick={handleValidate}>
                        Validar Entrega
                     </button>
                 </div>
              </div>
          </div>
        )}
                {/* Scanned Items Table with Search and Export */}
          {Object.keys(scannedItems).length > 0 && (
              <div className="details-table-wrapper" style={{marginTop: '20px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                      <h4>📦 Inventario en Curso ({Object.keys(scannedItems).length} items)</h4>
                      <div style={{display:'flex', gap:'10px'}}>
                          <input 
                              type="text" 
                              placeholder="🔍 Buscar artículo..." 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              style={{padding:'8px', borderRadius:'4px', border:'1px solid #ccc'}}
                          />
                          <button 
                              onClick={() => {
                                  const dataToExport = Object.entries(scannedItems).map(([name, itemData], index) => ({
                                      '#': index + 1,
                                      'Artículo': name,
                                      'Cantidad Contada': itemData.total
                                  }));
                                  exportToExcel(dataToExport, `Inventario_${currentCargaInfo?.placa || 'Carga'}`);
                              }}
                              style={{
                                  background:'#4CAF50', color:'white', border:'none', 
                                  padding:'8px 16px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'
                              }}
                          >
                              📤 Exportar Excel
                          </button>
                      </div>
                  </div>

                  <table className="details-table">
                      <thead>
                          <tr>
                              <th style={{width:'50px'}}>#</th>
                              <th>Artículo</th>
                              <th>Total Contado</th>
                          </tr>
                      </thead>
                      <tbody>
                          {Object.entries(scannedItems)
                             .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
                             .map(([name, itemData], index) => (
                              <tr key={name}>
                                  <td>{index + 1}</td>
                                  <td>{name}</td>
                                  <td style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                      <span style={{fontWeight:'bold', fontSize:'1.1em'}}>{itemData.total}</span>
                                      <button 
                                          onClick={() => handleRemoveOne(name, itemData)}
                                          style={{
                                              background:'#ffcdd2', border:'1px solid #e57373', color:'#c62828',
                                              borderRadius:'4px', padding:'2px 8px', cursor:'pointer', fontWeight:'bold'
                                          }}
                                          title="Restar 1 unidad"
                                      >
                                          -1
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
        
        {/* Scanned Items Summary (Local State or just Last Scan... User asked for "tabla con lo que se esta inventariando") */}
        {/* Since we don't have full history from backend in this view, we'll only show "Last Scan" prominently. 
            To show full history, we would need to store 'scannedItems' array in state. 
            Let's assume user accepts the "Total Acumulado" shown in lastScan as sufficient for now, 
            or we can implement a local list. I'll stick to the requested "table". 
            I need to add 'scannedItems' state to manage this. */}

      <style jsx>{`
        .tab-recibido {
            padding: 20px;
            background: #fff;
            border-radius: 8px;
        }
        .toolbar {
            display: flex;
            gap: 30px;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
            align-items: flex-end;
        }
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .carga-select {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            min-width: 300px;
        }
        .mode-switch .switch-container {
            display: flex;
            background: #eee;
            border-radius: 6px;
            padding: 4px;
            gap: 4px;
        }
        .mode-btn {
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            color: #666;
            background: transparent;
        }
        .mode-btn.active {
            background: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .mode-btn.active.unit { color: #2196F3; }
        .mode-btn.active.box { color: #FF9800; }

        .scan-area {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .input-wrapper input {
            font-size: 24px;
            padding: 15px;
            width: 100%;
            max-width: 500px;
            text-align: center;
            border: 2px solid #2196F3;
            border-radius: 8px;
            outline: none;
        }
        
        .scan-error {
            margin-top: 15px;
            color: white;
            background: #F44336;
            padding: 10px;
            border-radius: 4px;
            display: inline-block;
        }
        .scan-success {
            margin-top: 15px;
            background: #E8F5E9;
            color: #2E7D32;
            padding: 15px;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            text-align: left;
        }
        .scan-success .icon { font-size: 2em; }
        
        .actions {
            margin-top: 30px;
        }
        .btn-validate {
            background: #673AB7;
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 16px;
            border-radius: 6px;
            cursor: pointer;
        }
        .btn-validate:hover { background: #5E35B1; }

        .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .modal-content {
            background: white;
            padding: 30px;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
            text-align: center;
        }
        .modal-content.error h3 { color: #F44336; }
        .modal-content.success h3 { color: #4CAF50; }
        
        .novedades-list {
            text-align: left;
            margin: 20px 0;
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #eee;
            padding: 10px;
        }

        .carga-details-container {
            margin-bottom: 20px;
        }
        .info-card {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 15px;
            font-size: 0.9em;
        }
        .info-card h4 { margin-top: 0; margin-bottom: 10px; color: #333; }
        .details-table-wrapper {
            margin-bottom: 20px;
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #ddd;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85em;
        }
        .details-table th, .details-table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
            text-align: left;
        }
        .details-table th {
            background: #e9ecef;
            position: sticky;
            top: 0;
        }
      `}</style>
    </div>
  );
}
