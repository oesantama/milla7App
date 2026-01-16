'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { exportToExcel } from '../../../utils/exportToExcel';
import MasterImportControl from '../../components/MasterImportControl';

export default function ConductoresPage() {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('cedula');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState({ show: false, conductor: null });
  const [showFilters, setShowFilters] = useState(false);
  const [filterEstado, setFilterEstado] = useState('all');
  const { token, isAuthenticated, permissions, user } = useAuth();
  const router = useRouter();

  // Permissions logic
  const pagePermissions = permissions.find(p => p.nombre.toLowerCase().includes('conductor')) || {};
  const canCreate = pagePermissions.crear;
  const canEdit = pagePermissions.editar;
  const canDelete = pagePermissions.borrar;

  useEffect(() => {
    if (!isAuthenticated || !token) { router.push('/'); return; }
    const fetchConductores = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/core/conductores/', { headers: { Authorization: `Bearer ${token}` } });
        setConductores(response.data);
      } catch (err) {
        setError('Error al cargar conductores.');
      } finally {
        setLoading(false);
      }
    };
    fetchConductores();
  }, [isAuthenticated, token, router]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(dateString));
  };

  const handleSort = (column) => {
    if (sortColumn === column) { setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); } else { setSortColumn(column); setSortDirection('asc'); }
  };

  const filteredAndSortedConductores = conductores.filter(c => {
      const matchesSearch = c.cedula?.toLowerCase().includes(searchTerm.toLowerCase()) || c.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesEstado = true;
      if (filterEstado !== 'all') {
          matchesEstado = c.estado_descripcion?.toLowerCase() === filterEstado.toLowerCase();
      }
      return matchesSearch && matchesEstado;
  }).sort((a, b) => {
    let aVal = a[sortColumn]; let bVal = b[sortColumn];
    if (sortColumn === 'fecha_creacion' || sortColumn === 'fecha_modificacion') { aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime(); } else if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1; if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1; return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedConductores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedConductores.length / itemsPerPage);

  const handleExport = () => {
    const dataToExport = filteredAndSortedConductores.map(c => ({ Cédula: c.cedula, Nombre: c.nombre, Celular: c.celular, Licencia: c.licencia?.join(', '), Estado: c.estado_descripcion || 'Sin Asignar', 'Fecha de Creación': formatDate(c.fecha_creacion), 'Última Modificación': formatDate(c.fecha_modificacion) }));
    exportToExcel(dataToExport, 'conductores_milla7');
  };

  const confirmDelete = (conductor) => {
    setDeleteModal({ show: true, conductor });
  };

  const getBadgeColor = (estado) => {
      const e = estado?.toLowerCase() || '';
      if(e.includes('disponible') || e.includes('activo')) return { bg: '#e8f5e9', text: '#2e7d32' };
      if(e.includes('mantenimiento') || e.includes('licencia')) return { bg: '#fff3e0', text: '#ef6c00' };
      if(e.includes('ocupado') || e.includes('ruta')) return { bg: '#e3f2fd', text: '#1565c0' };
      return { bg: '#ffebee', text: '#c62828' };
  };

  const handleDelete = async () => {
    const cedula = deleteModal.conductor.cedula;
    setDeleteModal({ show: false, conductor: null });
    try {
      await axios.delete(`/api/core/conductores/${cedula}/`, { headers: { Authorization: `Bearer ${token}` } });
      
      const isRole1 = user?.role_id == 1 || user?.is_superuser;
      if (isRole1) {
          setConductores(conductores.map(c => c.cedula === cedula ? { ...c, eliminado: true } : c));
      } else {
          setConductores(conductores.filter(c => c.cedula !== cedula));
      }
    } catch (err) {
      alert('Error al eliminar el conductor');
    }
  };

  if (loading) return <div style={{textAlign:'center',padding:'50px',fontSize:'18px',color:'#666'}}>Cargando conductores...</div>;
  if (error) return <div style={{textAlign:'center',padding:'50px',fontSize:'18px',color:'#d32f2f'}}>{error}</div>;

  return (
    <div style={{padding:'30px',maxWidth:'1600px',margin:'0 auto',fontFamily:'Inter, sans-serif'}}>
      <h1 style={{fontSize:'28px',fontWeight:'700',color:'#1565c0',marginBottom:'25px',display:'flex',alignItems:'center'}}><i className="fa fa-id-card" style={{marginRight:'10px'}}></i>Gestión de Conductores</h1>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'25px',gap:'15px',flexWrap:'wrap'}}>
        <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
             <input type="text" placeholder="🔍 Buscar conductor..." style={{padding:'12px 18px',border:'2px solid #e0e0e0',borderRadius:'10px',fontSize:'15px',width:'250px',outline:'none',boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}} value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
             <button 
                onClick={() => setShowFilters(!showFilters)}
                style={{
                    padding:'12px 18px',
                    border:'2px solid #e0e0e0',
                    borderRadius:'10px',
                    background: showFilters ? '#e3f2fd' : '#fff',
                    color: showFilters ? '#1565c0' : '#666',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    gap:'8px',
                    fontWeight:'600'
                }}
             >
                <i className="fa fa-filter"></i>
                <span className="hide-on-mobile">Filtros</span>
                {filterEstado !== 'all' && <span style={{background:'#1565c0',color:'#fff',borderRadius:'50%',width:'20px',height:'20px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px'}}>1</span>}
             </button>
        </div>

        <div style={{display:'flex',gap:'12px', flexWrap:'wrap'}}>
          {canCreate && <button onClick={()=>router.push('/maestras/conductores/create')} style={{padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.1)',background:'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',color:'#fff'}}><i className="fa fa-plus" style={{marginRight:'8px'}}></i>Crear</button>}
          
          <MasterImportControl 
            modelName="conductores"
            headers={['Cedula', 'Nombre', 'Celular', 'Licencia']}
            onSuccess={() => {
                const fetchConductores = async () => {
                    try {
                        setLoading(true);
                        const response = await axios.get('/api/core/conductores/', { headers: { Authorization: `Bearer ${token}` } });
                        setConductores(response.data);
                    } catch (err) { setError('Error al recargar.'); } finally { setLoading(false); }
                };
                fetchConductores();
            }}
          />

          <button onClick={handleExport} className="export-btn" style={{padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.1)',background:'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',color:'#fff'}}>
              <i className="fa fa-file-excel" style={{marginRight:'8px'}}></i>
              <span className="export-text">Exportar</span>
          </button>
        </div>
      </div>

      {showFilters && (
          <div style={{background:'#f8f9fa', padding:'20px', borderRadius:'12px', marginBottom:'20px', border:'1px solid #e0e0e0', display:'flex', gap:'20px', alignItems:'center', flexWrap:'wrap'}}>
              <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                  <label style={{fontSize:'12px', fontWeight:'600', color:'#666'}}>Estado</label>
                  <select 
                    value={filterEstado} 
                    onChange={(e) => setFilterEstado(e.target.value)}
                    style={{padding:'8px 12px', borderRadius:'6px', border:'1px solid #ccc', minWidth:'150px'}}
                  >
                      <option value="all">Todos</option>
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="vacaciones">Vacaciones</option>
                  </select>
              </div>
              <button 
                onClick={() => { setFilterEstado('all'); setSearchTerm(''); }}
                style={{alignSelf:'flex-end', padding:'8px 12px', background:'transparent', border:'none', color:'#c62828', cursor:'pointer', fontSize:'13px', textDecoration:'underline'}}
              >
                  Limpiar Filtros
              </button>
          </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
            .hide-on-mobile { display: none; }
            .export-text { display: none; }
            .export-btn { padding: 12px !important; }
        }
      `}</style>

      <div style={{background:'#fff',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.08)',overflow:'hidden',overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('cedula')}>Cédula {sortColumn==='cedula'&&(sortDirection==='asc'?'▲':'▼')}</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('nombre')}>Nombre {sortColumn==='nombre'&&(sortDirection==='asc'?'▲':'▼')}</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('celular')}>Celular {sortColumn==='celular'&&(sortDirection==='asc'?'▲':'▼')}</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('licencia')}>Licencia {sortColumn==='licencia'&&(sortDirection==='asc'?'▲':'▼')}</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('estado_descripcion')}>Estado {sortColumn==='estado_descripcion'&&(sortDirection==='asc'?'▲':'▼')}</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('fecha_creacion')}>Fecha de Creación {sortColumn==='fecha_creacion'&&(sortDirection==='asc'?'▲':'▼')}</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('fecha_modificacion')}>Última Modificación {sortColumn==='fecha_modificacion'&&(sortDirection==='asc'?'▲':'▼')}</th>
              {(canEdit||canDelete)&&<th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((c) => {
              const badge = getBadgeColor(c.estado_descripcion);
              return (
                <tr key={c.cedula} style={{borderBottom:'1px solid #f0f0f0'}}>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{c.cedula}</td>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{c.nombre}</td>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{c.celular}</td>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{c.licencia?.join(', ') || '-'}</td>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>
                    {c.eliminado ? (
                        <span style={{padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',display:'inline-block',background:'#ffcdd2',color:'#b71c1c'}}>Eliminado</span>
                    ) : (
                        <span style={{padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',display:'inline-block',background:badge.bg,color:badge.text}}>
                          {c.estado_descripcion || 'Sin Asignar'}
                        </span>
                    )}
                  </td>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{formatDate(c.fecha_creacion)}</td>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{formatDate(c.fecha_modificacion)}</td>
                  {(canEdit||canDelete)&&(
                    <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>
                      {!c.eliminado && (
                          <div style={{display:'flex',gap:'8px'}}>
                          {canEdit&&<button onClick={()=>router.push(`/maestras/conductores/${c.cedula}/edit`)} style={{padding:'8px 12px',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',color:'#fff',background:'#FFA726'}} title="Editar conductor"><i className="fa fa-pencil-alt"></i></button>}
                          {canDelete&&<button onClick={()=>confirmDelete(c)} style={{padding:'8px 12px',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',color:'#fff',background:'#EF5350'}} title="Eliminar conductor"><i className="fa fa-trash-alt"></i></button>}
                          </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredAndSortedConductores.length > 0 && (
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'20px',padding:'10px',background:'#fff',borderRadius:'8px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'15px'}}>
                <span style={{fontSize:'14px',color:'#666'}}>Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredAndSortedConductores.length)} de {filteredAndSortedConductores.length} resultados</span>
                <select 
                    value={itemsPerPage} 
                    onChange={(e) => { setCurrentPage(1); setItemsPerPage(Number(e.target.value)); }}
                    style={{padding:'5px 10px',borderRadius:'4px',border:'1px solid #ddd',fontSize:'14px'}}
                >
                    <option value={10}>10 por página</option>
                    <option value={25}>25 por página</option>
                    <option value={50}>50 por página</option>
                    <option value={100}>100 por página</option>
                </select>
            </div>
            <div style={{display:'flex',gap:'5px'}}>
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                    style={{padding:'8px 12px',border:'1px solid #ddd',borderRadius:'4px',background:currentPage===1?'#f5f5f5':'#fff',cursor:currentPage===1?'default':'pointer',color:currentPage===1?'#999':'#333'}}
                >
                    Anterior
                </button>
                {Array.from({length: Math.min(5, Math.ceil(filteredAndSortedConductores.length / itemsPerPage))}, (_, i) => {
                    let pageNum = i + 1; 
                    if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 2 + i;
                    if (pageNum > totalPages) return null;

                    return (
                        <button 
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                                padding:'8px 12px',
                                border:'1px solid',
                                borderColor: currentPage === pageNum ? '#1565c0' : '#ddd',
                                borderRadius:'4px',
                                background: currentPage === pageNum ? '#1565c0' : '#fff',
                                color: currentPage === pageNum ? '#fff' : '#333',
                                cursor:'pointer'
                            }}
                        >
                            {pageNum}
                        </button>
                    );
                })}
                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                    style={{padding:'8px 12px',border:'1px solid #ddd',borderRadius:'4px',background:currentPage===totalPages?'#f5f5f5':'#fff',cursor:currentPage===totalPages?'default':'pointer',color:currentPage===totalPages?'#999':'#333'}}
                >
                    Siguiente
                </button>
            </div>
        </div>
      )}
      
      {deleteModal.show && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div style={{background:'#fff',borderRadius:'16px',padding:'32px',maxWidth:'450px',width:'90%',boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <div style={{width:'64px',height:'64px',margin:'0 auto 16px',background:'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <i className="fa fa-exclamation-triangle" style={{fontSize:'32px',color:'#fff'}}></i>
              </div>
              <h2 style={{fontSize:'24px',fontWeight:'700',color:'#333',margin:'0 0 8px 0'}}>¿Eliminar Conductor?</h2>
              <p style={{fontSize:'15px',color:'#666',margin:0}}>¿Está seguro de eliminar el conductor <strong>{deleteModal.conductor?.nombre}</strong>?</p>
              <p style={{fontSize:'13px',color:'#999',marginTop:'8px'}}>Esta acción no se puede deshacer.</p>
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={()=>setDeleteModal({show:false,conductor:null})} style={{flex:1,padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',background:'#ef5350',color:'#fff',transition:'all 0.3s ease'}}>
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