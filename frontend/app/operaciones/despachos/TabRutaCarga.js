'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function TabRutaCarga() {
  const [pendingItems, setPendingItems] = useState([]); // { id, n_ped, direccion, volumen, items_count }
  const [vehicles, setVehicles] = useState([]); // [{ id, placa, capacidad_real, capacidad_90, facturas: [] }]
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token'); // Should use AuthContext ideally
      
      // Fetch Pending Items
      const resPending = await axios.get('/api/routes/pending-items/', { headers: { Authorization: `Bearer ${token}` } });
      setPendingItems(resPending.data);
      
      // We could also fetch Vehicles here if manual assignment logic exists, 
      // but for now relying on Auto-Route to populate vehicles first?
      // Or maybe show empty vehicles? Let's just focus on pending first.
      
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire('Error', 'No se pudieron cargar los datos iniciales', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoRoute = async () => {
    if (pendingItems.length === 0) {
      Swal.fire('Aviso', 'No hay pedidos pendientes para rutear', 'warning');
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post('/api/routes/auto-route/', 
        { invoices: pendingItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Auto Route Result:", res.data);
      setVehicles(res.data.routes || []);
      
      // Update pending items with unassigned ones
      setPendingItems(res.data.unassigned || []);

      if (res.data.routes.length > 0) {
          Swal.fire('Rutas Generadas', `Se han sugerido ${res.data.routes.length} vehículos.`, 'success');
      } else {
          Swal.fire('Aviso', 'No se pudieron generar rutas (tal vez no hay vehículos disponibles)', 'info');
      }

    } catch (error) {
       console.error("Error auto-routing:", error);
       Swal.fire('Error', error.response?.data?.error || 'Error generando rutas', 'error');
    } finally {
       setGenerating(false);
    }
  };

  const handleSaveRoutes = async () => {
     // Validate?
     const token = localStorage.getItem('access_token');
     try {
         const res = await axios.post('/api/routes/', { routes: vehicles }, { headers: { Authorization: `Bearer ${token}` } });
         Swal.fire('Guardado', 'Despachos guardados correctamente', 'success');
         // Reset?
         setVehicles([]);
         fetchInitialData(); // Refresh pending
     } catch (e) {
         Swal.fire('Error', 'Error guardando despachos', 'error');
     }
  };
  
  // --- Drag & Drop Placeholders (Simulated Click to Move for MVP stability) ---
  // A simple "Move to Next Vehicle" or dropdown could work if DnD is complex to implement blindly.
  // Let's implement a "Move" button on hover.

  const moveToPending = (vehIndex, invIndex) => {
      const vehs = [...vehicles];
      const inv = vehs[vehIndex].facturas[invIndex];
      
      vehs[vehIndex].facturas.splice(invIndex, 1);
      // Recalc volume
      vehs[vehIndex].asignado_vol -= inv.volumen || 0;
      
      setVehicles(vehs);
      setPendingItems([...pendingItems, inv]);
  };

  const showLogicHelp = () => {
    Swal.fire({
      title: '¿Cómo funciona el Ruteo Automático?',
      html: `
        <div style="text-align: left; font-size: 0.9em;">
          <p>El sistema utiliza un algoritmo de optimización <b>"First Fit Decreasing"</b> con las siguientes reglas:</p>
          <ul style="margin-left: 20px; list-style-type: disc;">
            <li><b>Capacidad al 90%:</b> Solo se utiliza el 90% del cubicaje total de cada vehículo para dar margen de maniobra.</li>
            <li><b>Prioridad de Vehículos:</b> Se llenan primero los vehículos más grandes.</li>
            <li><b>Agrupación:</b> Los pedidos con la misma dirección se agrupan y se asignan juntos.</li>
            <li><b>Asignación:</b> Se asignan primero los grupos de pedidos más voluminosos al primer vehículo con espacio disponible.</li>
          </ul>
          <p style="margin-top:10px;"><i>Nota: Solo se usan vehículos marcados como "Disponibles".</i></p>
        </div>
      `,
      icon: 'question',
      width: '600px'
    });
  };

  return (
    <div className="tab-ruta-container">
      <div className="top-controls">
         <button className="btn-auto py-2" onClick={handleAutoRoute} disabled={generating}>
            {generating ? 'Generando...' : '⚡ Ruteo Automático'}
         </button>
         <button className="btn-help" onClick={showLogicHelp} title="Ver lógica de asignación">
            ❓
         </button>
         <div className="spacer"></div>
         <button className="btn-save py-2" onClick={handleSaveRoutes} disabled={vehicles.length===0}>
            💾 Guardar Despachos
         </button>
      </div>

       <div className="workspace">
          {/* Left Panel: Pending */}
          <div className="panel pending-panel">
             <h3>🥡 Bolsa de Pedidos ({pendingItems.length})</h3>
             <div className="cards-list">
                {pendingItems.map((item, idx) => (
                    <div key={idx} className="invoice-card">
                       <div className="card-header">
                          <span className="ped-id">#{item.n_ped}</span>
                          <span className="vol-badge">{item.volumen} m³</span>
                       </div>
                       <p className="card-addr">{item.direccion}</p>
                       <p className="card-client">{item.cliente}</p>
                    </div>
                ))}
                {pendingItems.length === 0 && <p className="empty-msg">No hay pedidos pendientes</p>}
             </div>
          </div>

          {/* Right Panel: Vehicles */}
          <div className="panel routes-panel">
             <h3>🚛 Planificación de Flota ({vehicles.length})</h3>
             <div className="vehicles-grid">
                {vehicles.map((veh, vIdx) => {
                   const percent = (veh.asignado_vol / veh.capacidad_real) * 100;
                   const isOver90 = percent > 90; // The limit we set
                   
                   return (
                    <div key={vIdx} className="vehicle-card">
                       <div className="veh-header">
                          <h4>{veh.placa}</h4>
                          <span className="cap-info">{veh.asignado_vol.toFixed(2)} / {veh.capacidad_real} m³</span>
                       </div>
                       
                       {/* Progress Bar */}
                       <div className="progress-bar-bg">
                          <div 
                            className="progress-bar-fill" 
                            style={{
                                width: `${Math.min(percent, 100)}%`,
                                background: isOver90 ? '#ff5252' : (percent > 85 ? '#ffab00' : '#4caf50')
                            }}
                          ></div>
                       </div>
                       
                       <div className="veh-content">
                          {veh.facturas.map((inv, iIdx) => (
                              <div key={iIdx} className="invoice-row">
                                 <div>
                                    <span className="inv-ref">#{inv.n_ped}</span>
                                    <small>{inv.direccion}</small>
                                 </div>
                                 <button className="btn-remove" onClick={() => moveToPending(vIdx, iIdx)}>✖</button>
                              </div>
                          ))}
                          {veh.facturas.length === 0 && <p className="empty-veh">Sin carga asignada</p>}
                       </div>
                    </div>
                   );
                })}
             </div>
          </div>
       </div>

       <style jsx>{`
          .ruta-carga-container { padding: 20px; font-family: 'Inter', sans-serif; }
          .top-controls { display: flex; gap: 10px; margin-bottom: 20px; align-items: center; }
          .btn-auto { background: #6c5ce7; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;}
          .btn-auto:hover { background: #3700b3; }
          .btn-help { background: #e0e0e0; color: #333; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;}
          .btn-help:hover { background: #d0d0d0; }
          .btn-save { background: #2ed573; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;}
          
          .workspace { display: grid; grid-template-columns: 350px 1fr; gap: 20px; min-height: 600px; }
          .panel { background: #f5f5f5; border-radius: 12px; padding: 15px; display: flex; flex-direction: column; }
          .panel h3 { margin-top: 0; color: #333; font-size: 1.1rem; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          
          .pending-panel { border: 1px solid #e0e0e0; background: #fff; }
          .routes-panel { background: #fafafa; }
          
          .cards-list { overflow-y: auto; flex: 1; display:flex; flex-direction:column; gap: 10px; max-height: 70vh; }
          .invoice-card { background: white; border: 1px solid #eee; padding: 10px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); cursor: grab; }
          
          .card-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .ped-id { font-weight: bold; color: #1565c0; }
          .vol-badge { background: #e3f2fd; color: #1565c0; padding: 2px 6px; border-radius: 10px; font-size: 0.8rem; }
          .card-addr { font-size: 0.85rem; color: #333; margin: 2px 0; font-weight: 500;}
          .card-client { font-size: 0.75rem; color: #666; margin: 0; }
          
          .vehicles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; overflow-y: auto; max-height: 75vh; }
          .vehicle-card { background: white; border-radius: 8px; padding: 15px; border: 1px solid #ddd; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
          .veh-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
          .veh-header h4 { margin: 0; font-size: 1.1rem; }
          
          .progress-bar-bg { height: 8px; background: #eee; border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
          .progress-bar-fill { height: 100%; transition: width 0.3s ease; }
          
          .veh-content { flex: 1; display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; }
          .invoice-row { display: flex; justify-content: space-between; align-items: center; padding: 8px; background: #f9f9f9; border-radius: 4px; border: 1px solid #f0f0f0; }
          .inv-ref { font-weight: bold; font-size: 0.9rem; display: block; }
          .btn-remove { background: none; border: none; color: #999; cursor: pointer; font-size: 1.2rem; }
          .btn-remove:hover { color: #f44336; }
          
          @media (max-width: 900px) {
             .workspace { grid-template-columns: 1fr; } 
          }
       `}</style>
    </div>
  );
}
