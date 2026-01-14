'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { exportToExcel } from '../../../utils/exportToExcel';
import MasterImportControl from '../../components/MasterImportControl';

export default function TiposVehiculosPage() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('descripcion');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteModal, setDeleteModal] = useState({ show: false, tipo: null });
  const { token, isAuthenticated, permissions, user } = useAuth();
  const router = useRouter();

  // Permissions logic
  // "Tipos Vehículos - Consulta Tipo Vehiculo"
  const pagePermissions = permissions.find(p => {
    const name = p.nombre.toLowerCase();
    return name.includes('tipos vehículos') || name.includes('tipo vehiculo') || name.includes('consulta tipo');
  }) || {};
  
  // Tab Checks: "Creacion Tipo"
  // But wait, the user said: "tendra tun tab llamado creacion tipo y otro llamado consulta tipo vehiculo"
  // And simple logic: "si crear esta true le permita crear".
  // So we use pagePermissions.crear/editar/borrar.
  const isSuperUser = user?.is_superuser || user?.role_id === 1;
  const canCreate = pagePermissions.crear || isSuperUser;
  const canEdit = pagePermissions.editar || isSuperUser;
  const canDelete = pagePermissions.borrar || isSuperUser;

  useEffect(() => {
    if (!isAuthenticated || !token) { router.push('/'); return; }
    const fetchTipos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/core/tipos-vehiculos/', { headers: { Authorization: `Bearer ${token}` } });
        setTipos(response.data);
      } catch (err) {
        setError('Error al cargar tipos de vehículos.');
      } finally {
        setLoading(false);
      }
    };
    fetchTipos();
  }, [isAuthenticated, token, router]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(dateString));
  };

  const handleSort = (column) => {
    if (sortColumn === column) { setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); } else { setSortColumn(column); setSortDirection('asc'); }
  };

  const filteredTipos = tipos.filter(t => 
    t.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    let aVal = a[sortColumn]; let bVal = b[sortColumn];
    if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1; 
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1; 
    return 0;
  });

  const handleExport = () => {
    const dataToExport = filteredTipos.map(t => ({ 
      ID: t.id,
      Descripción: t.descripcion, 
      Estado: t.estado ? 'Activo' : 'Inactivo', 
      'Fecha de Creación': formatDate(t.fecha_creacion),
      'Fecha Modificación': formatDate(t.fecha_modificacion)
    }));
    exportToExcel(dataToExport, 'tipos_vehiculos_milla7');
  };

  const confirmDelete = (tipo) => {
    setDeleteModal({ show: true, tipo });
  };

  const handleDelete = async () => {
    const id = deleteModal.tipo.id;
    setDeleteModal({ show: false, tipo: null });
    try {
      await axios.delete(`/api/core/tipos-vehiculos/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      
      const isRole1 = user?.role_id == 1 || user?.is_superuser;
      if (isRole1) {
          setTipos(tipos.map(t => t.id === id ? { ...t, eliminado: true } : t));
      } else {
          setTipos(tipos.filter(t => t.id !== id));
      }
    } catch (err) {
      alert('Error al eliminar el tipo de vehículo');
    }
  };

  if (loading) return <div style={{textAlign:'center',padding:'50px',fontSize:'18px',color:'#666'}}>Cargando tipos...</div>;
  if (error) return <div style={{textAlign:'center',padding:'50px',fontSize:'18px',color:'#d32f2f'}}>{error}</div>;

  return (
    <div style={{padding:'30px',maxWidth:'1600px',margin:'0 auto',fontFamily:'Inter, sans-serif'}}>
      <h1 style={{fontSize:'28px',fontWeight:'700',color:'#1565c0',marginBottom:'25px',display:'flex',alignItems:'center'}}><i className="fa fa-truck-moving" style={{marginRight:'10px'}}></i>Gestión de Tipos de Vehículos</h1>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'25px',gap:'15px',flexWrap:'wrap'}}>
        <input type="text" placeholder="🔍 Buscar tipo..." style={{padding:'12px 18px',border:'2px solid #e0e0e0',borderRadius:'10px',fontSize:'15px',width:'300px',outline:'none',boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}} value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
        <div style={{display:'flex',gap:'12px'}}>
          {canCreate && <button onClick={()=>router.push('/maestras/tipos_vehiculos/create')} style={{padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.1)',background:'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',color:'#fff'}}><i className="fa fa-plus" style={{marginRight:'8px'}}></i>Crear Tipo</button>}
          
          <MasterImportControl 
            modelName="tipos_vehiculos"
            headers={['Descripcion']}
            onSuccess={() => {
                const fetchTipos = async () => {
                    try {
                        setLoading(true);
                        const response = await axios.get('/api/core/tipos-vehiculos/', { headers: { Authorization: `Bearer ${token}` } });
                        setTipos(response.data);
                    } catch (err) { setError('Error al recargar.'); } finally { setLoading(false); }
                };
                fetchTipos();
            }}
          />

          <button onClick={handleExport} style={{padding:'12px 24px',border:'1px solid #2e7d32',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',background:'#e8f5e9',color:'#2e7d32'}}><i className="fa fa-file-excel" style={{marginRight:'8px'}}></i>Exportar</button>
        </div>
      </div>

      <div style={{overflowX:'auto',background:'#fff',borderRadius:'12px',boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:'1000px'}}>
          <thead>
            <tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>
              <th onClick={()=>handleSort('id')} style={{padding:'16px',textAlign:'left',fontWeight:'600',color:'#475569',cursor:'pointer'}}>ID {sortColumn==='id' && (sortDirection==='asc'?'▲':'▼')}</th>
              <th onClick={()=>handleSort('descripcion')} style={{padding:'16px',textAlign:'left',fontWeight:'600',color:'#475569',cursor:'pointer'}}>Descripción {sortColumn==='descripcion' && (sortDirection==='asc'?'▲':'▼')}</th>
              <th onClick={()=>handleSort('estado')} style={{padding:'16px',textAlign:'left',fontWeight:'600',color:'#475569',cursor:'pointer'}}>Estado</th>
              <th style={{padding:'16px',textAlign:'left',fontWeight:'600',color:'#475569'}}>F. Creación</th>
              <th style={{padding:'16px',textAlign:'left',fontWeight:'600',color:'#475569'}}>Usr. Creación</th>
              <th style={{padding:'16px',textAlign:'left',fontWeight:'600',color:'#475569'}}>F. Modif.</th>
              <th style={{padding:'16px',textAlign:'left',fontWeight:'600',color:'#475569'}}>Usr. Modif.</th>
              <th style={{padding:'16px',textAlign:'center',fontWeight:'600',color:'#475569'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTipos.map(t => (
              <tr key={t.id} style={{borderBottom:'1px solid #e2e8f0',transition:'background-color 0.2s'}}>
                <td style={{padding:'16px',color:'#1e293b'}}>{t.id}</td>
                <td style={{padding:'16px',color:'#1e293b',fontWeight:'600'}}>{t.descripcion}</td>
                <td style={{padding:'16px'}}>
                  {t.eliminado ? (
                      <span style={{padding:'4px 12px',borderRadius:'20px',fontSize:'13px',fontWeight:'500',background:'#ffcdd2',color:'#b71c1c'}}>Eliminado</span>
                  ) : (
                      <span style={{padding:'4px 12px',borderRadius:'20px',fontSize:'13px',fontWeight:'500',background:t.estado?'#dcfce7':'#fee2e2',color:t.estado?'#166534':'#991b1b'}}>{t.estado?'Activo':'Inactivo'}</span>
                  )}
                </td>
                <td style={{padding:'16px',color:'#64748b',fontSize:'14px'}}>{formatDate(t.fecha_creacion)}</td>
                <td style={{padding:'16px',color:'#64748b',fontSize:'14px'}}>{t.usuario_creacion_nombre || '-'}</td>
                <td style={{padding:'16px',color:'#64748b',fontSize:'14px'}}>{formatDate(t.fecha_modificacion)}</td>
                <td style={{padding:'16px',color:'#64748b',fontSize:'14px'}}>{t.usuario_modificacion_nombre || '-'}</td>
                {(canEdit || canDelete) && ( // Ensure logical OR
                  <td style={{padding:'16px',textAlign:'center'}}>
                    {!t.eliminado && (
                       <div style={{display:'flex',justifyContent:'center',gap:'8px'}}>
                        {canEdit && <button onClick={()=>router.push(`/maestras/tipos_vehiculos/${t.id}/edit`)} style={{border:'none',background:'transparent',cursor:'pointer',color:'#3b82f6',padding:'8px',borderRadius:'6px'}} title="Editar"><i className="fa fa-edit" style={{fontSize:'16px'}}></i></button>}
                        {canDelete && <button onClick={()=>confirmDelete(t)} style={{border:'none',background:'transparent',cursor:'pointer',color:'#ef4444',padding:'8px',borderRadius:'6px'}} title="Eliminar"><i className="fa fa-trash-alt" style={{fontSize:'16px'}}></i></button>}
                       </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filteredTipos.length === 0 && <tr><td colSpan="8" style={{padding:'40px',textAlign:'center',color:'#64748b'}}>No se encontraron tipos de vehículos.</td></tr>}
          </tbody>
        </table>
      </div>
      
      {/* Modal de Confirmación */}
      {deleteModal.show && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div style={{background:'#fff',borderRadius:'16px',padding:'32px',maxWidth:'450px',width:'90%',boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <div style={{width:'64px',height:'64px',margin:'0 auto 16px',background:'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <i className="fa fa-exclamation-triangle" style={{fontSize:'32px',color:'#fff'}}></i>
              </div>
              <h2 style={{fontSize:'24px',fontWeight:'700',color:'#333',margin:'0 0 8px 0'}}>¿Eliminar Tipo?</h2>
              <p style={{fontSize:'15px',color:'#666',margin:0}}>¿Está seguro de eliminar el tipo <strong>{deleteModal.tipo?.descripcion}</strong>?</p>
              <p style={{fontSize:'13px',color:'#999',marginTop:'8px'}}>Esta acción no se puede deshacer.</p>
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={()=>setDeleteModal({show:false,tipo:null})} style={{flex:1,padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',background:'#ef5350',color:'#fff',transition:'all 0.3s ease'}}>
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
