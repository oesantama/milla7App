'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { exportToExcel } from '../../../utils/exportToExcel';
import MasterImportControl from '../../components/MasterImportControl';

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('placa');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteModal, setDeleteModal] = useState({ show: false, vehiculo: null });
  const { token, isAuthenticated, fullAccess, permissions, user } = useAuth();
  const router = useRouter();

  // Permissions logic
  // Permissions logic
  const pagePermissions = permissions.find(p => {
    const name = p.nombre.toLowerCase();
    return name.includes('vehiculo') || name.includes('vehículo');
  }) || {};
  const canCreate = pagePermissions.crear;
  const canEdit = pagePermissions.editar;
  const canDelete = pagePermissions.borrar;

  useEffect(() => {
    if (!isAuthenticated || !token) { router.push('/'); return; }
    const fetchVehiculos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/core/vehiculos/', { headers: { Authorization: `Bearer ${token}` } });
        setVehiculos(response.data);
      } catch (err) {
        setError('Error al cargar vehículos.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehiculos();
  }, [isAuthenticated, token, router]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(dateString));
  };

  const handleSort = (column) => {
    if (sortColumn === column) { setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); } else { setSortColumn(column); setSortDirection('asc'); }
  };

  const filteredAndSortedVehiculos = vehiculos.filter(v => 
    v.placa?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.propietario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    let aVal = a[sortColumn]; let bVal = b[sortColumn];
    if (sortColumn === 'disponible') { aVal = aVal ? 1 : 0; bVal = bVal ? 1 : 0; } 
    else if (sortColumn === 'fecha_creacion' || sortColumn === 'fecha_modificacion') { aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime(); } 
    else if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1; 
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1; 
    return 0;
  });

  const handleExport = () => {
    const dataToExport = filteredAndSortedVehiculos.map(v => ({ 
      Placa: v.placa, 
      Propietario: v.propietario, 
      Modelo: v.modelo, 
      Cubicaje: v.cubicaje, 
      Disponible: v.disponible ? 'Sí' : 'No', 
      'Fecha de Creación': formatDate(v.fecha_creacion), 
      'Última Modificación': formatDate(v.fecha_modificacion) 
    }));
    exportToExcel(dataToExport, 'vehiculos_milla7');
  };

  const confirmDelete = (vehiculo) => {
    setDeleteModal({ show: true, vehiculo });
  };

  const handleDelete = async () => {
    const placa = deleteModal.vehiculo.placa;
    setDeleteModal({ show: false, vehiculo: null });
    
    try {
      await axios.delete(`/api/core/vehiculos/${placa}/`, { headers: { Authorization: `Bearer ${token}` } });
      
      // Use loose equality for role_id to catch string/number differences
      const isRole1 = user?.role_id == 1 || user?.is_superuser;
      if (isRole1) {
          setVehiculos(vehiculos.map(v => v.placa === placa ? { ...v, eliminado: true } : v));
      } else {
          setVehiculos(vehiculos.filter(v => v.placa !== placa));
      }
    } catch (err) {
      alert('Error al eliminar el vehículo');
    }
  };

  if (loading) return <div style={{textAlign:'center',padding:'50px',fontSize:'18px',color:'#666'}}>Cargando vehículos...</div>;
  if (error) return <div style={{textAlign:'center',padding:'50px',fontSize:'18px',color:'#d32f2f'}}>{error}</div>;

  return (
    <div style={{padding:'30px',maxWidth:'1600px',margin:'0 auto',fontFamily:'Inter, sans-serif'}}>
      <h1 style={{fontSize:'28px',fontWeight:'700',color:'#1565c0',marginBottom:'25px',display:'flex',alignItems:'center'}}><i className="fa fa-truck" style={{marginRight:'10px'}}></i>Gestión de Vehículos</h1>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'25px',gap:'15px',flexWrap:'wrap'}}>
        <input type="text" placeholder="🔍 Buscar placa, propietario..." style={{padding:'12px 18px',border:'2px solid #e0e0e0',borderRadius:'10px',fontSize:'15px',width:'300px',outline:'none',boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}} value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
        <div style={{display:'flex',gap:'12px'}}>
          {canCreate && <button onClick={()=>router.push('/maestras/vehiculos/create')} style={{padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.1)',background:'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',color:'#fff'}}><i className="fa fa-plus" style={{marginRight:'8px'}}></i>Crear Vehículo</button>}
          
          <MasterImportControl 
            modelName="vehiculos"
            headers={['Placa', 'Propietario', 'Modelo', 'Tipo Vehiculo']}
            onSuccess={() => {
                const fetchVehiculos = async () => {
                    try {
                        setLoading(true);
                        const response = await axios.get('/api/core/vehiculos/', { headers: { Authorization: `Bearer ${token}` } });
                        setVehiculos(response.data);
                    } catch (err) { setError('Error al recargar.'); } finally { setLoading(false); }
                };
                fetchVehiculos();
            }}
          />

          <button onClick={handleExport} style={{padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.1)',background:'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',color:'#fff'}}><i className="fa fa-file-excel" style={{marginRight:'8px'}}></i>Exportar a Excel</button>
        </div>
      </div>
      <div style={{background:'#fff',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.08)',overflow:'hidden',overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse', minWidth: '800px'}}>
          <thead>
            <tr>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('placa')}>Placa {sortColumn==='placa'&&(sortDirection==='asc'?'▲':'▼')}</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('propietario')}>Propietario {sortColumn==='propietario'&&(sortDirection==='asc'?'▲':'▼')}</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('modelo')}>Modelo {sortColumn==='modelo'&&(sortDirection==='asc'?'▲':'▼')}</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('tipo_vehiculo_descripcion')}>Tipo {sortColumn==='tipo_vehiculo_descripcion'&&(sortDirection==='asc'?'▲':'▼')}</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('cubicaje')}>Cubicaje {sortColumn==='cubicaje'&&(sortDirection==='asc'?'▲':'▼')}</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('disponible')}>Disponible {sortColumn==='disponible'&&(sortDirection==='asc'?'▲':'▼')}</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('fecha_creacion')}>Fecha de Creación {sortColumn==='fecha_creacion'&&(sortDirection==='asc'?'▲':'▼')}</th>
              {(canEdit||canDelete)&&<th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedVehiculos.map(v=>(
              <tr key={v.placa} style={{borderBottom:'1px solid #f0f0f0'}}>
                <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{v.placa}</td>
                <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{v.propietario}</td>
                <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{v.modelo}</td>
                <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{v.tipo_vehiculo_descripcion || '-'}</td>
                <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{v.cubicaje}</td>
                <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>
                  {v.eliminado ? (
                      <span style={{padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',display:'inline-block',background:'#ffcdd2',color:'#b71c1c'}}>Eliminado</span>
                  ) : (
                      <span style={{padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',display:'inline-block',background:v.disponible?'#e8f5e9':'#ffebee',color:v.disponible?'#2e7d32':'#c62828'}}>{v.disponible?'Disponible':'No Disponible'}</span>
                  )}
                </td>
                <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{formatDate(v.fecha_creacion)}</td>
                {(canEdit||canDelete)&&(
                  <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>
                    {!v.eliminado && (
                        <div style={{display:'flex',gap:'8px'}}>
                        {canEdit&&<button onClick={()=>router.push(`/maestras/vehiculos/${v.placa}/edit`)} style={{padding:'8px 12px',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',color:'#fff',background:'#FFA726'}} title="Editar vehículo"><i className="fa fa-pencil-alt"></i></button>}
                        {canDelete&&<button onClick={()=>confirmDelete(v)} style={{padding:'8px 12px',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',color:'#fff',background:'#EF5350'}} title="Eliminar vehículo"><i className="fa fa-trash-alt"></i></button>}
                        </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredAndSortedVehiculos.length===0&&<div style={{textAlign:'center',padding:'60px',color:'#999'}}><i className="fa fa-truck" style={{fontSize:'48px',color:'#ccc',marginBottom:'10px'}}></i><p>No se encontraron vehículos</p></div>}
    
      {/* Modal de Confirmación */}
      {deleteModal.show && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div style={{background:'#fff',borderRadius:'16px',padding:'32px',maxWidth:'450px',width:'90%',boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <div style={{width:'64px',height:'64px',margin:'0 auto 16px',background:'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <i className="fa fa-exclamation-triangle" style={{fontSize:'32px',color:'#fff'}}></i>
              </div>
              <h2 style={{fontSize:'24px',fontWeight:'700',color:'#333',margin:'0 0 8px 0'}}>¿Eliminar Vehículo?</h2>
              <p style={{fontSize:'15px',color:'#666',margin:0}}>¿Está seguro de eliminar el vehículo con placa <strong>{deleteModal.vehiculo?.placa}</strong>?</p>
              <p style={{fontSize:'13px',color:'#999',marginTop:'8px'}}>Esta acción no se puede deshacer.</p>
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={()=>setDeleteModal({show:false,vehiculo:null})} style={{flex:1,padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',background:'#ef5350',color:'#fff',transition:'all 0.3s ease'}}>
                <i className="fa fa-times" style={{marginRight:'8px'}}></i>Cancelar
              </button>
              <button onClick={handleDelete} style={{flex:1,padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',background:'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',color:'#fff',transition:'all 0.3s ease'}}>
                <i className="fa fa-check" style={{marginRight:'8px'}}></i>Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
