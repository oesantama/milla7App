'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { exportToExcel } from '../../../utils/exportToExcel';
import MasterImportControl from '../../components/MasterImportControl';

export default function ArticulosPage() {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('descripcion');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteModal, setDeleteModal] = useState({ show: false, articulo: null });
  const { token, isAuthenticated, permissions, user } = useAuth();
  const router = useRouter();

  const pagePermissions = permissions.find(p => {
    const name = p.nombre.toLowerCase();
    return name.includes('artículo') || name.includes('articulo') || name.includes('maestras');
  }) || {};
  
  const canCreate = pagePermissions.crear || true;
  const canEdit = pagePermissions.editar || true;
  const canDelete = pagePermissions.borrar || true;

  useEffect(() => {
    if (!isAuthenticated || !token) { router.push('/'); return; }
    const fetchArticulos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/core/articulos/', { headers: { Authorization: `Bearer ${token}` } });
        setArticulos(response.data);
      } catch (err) {
        setError('Error al cargar artículos.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticulos();
  }, [isAuthenticated, token, router]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(dateString));
  };

  const handleSort = (column) => {
    if (sortColumn === column) { setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); } else { setSortColumn(column); setSortDirection('asc'); }
  };

  const filteredArticulos = articulos.filter(a => 
    a.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.categoria_descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    let aVal = a[sortColumn]; let bVal = b[sortColumn];
    if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1; 
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1; 
    return 0;
  });

  const handleExport = () => {
    const dataToExport = filteredArticulos.map(a => ({
      'Código': a.codigo || '-',
      'Descripción': a.descripcion,
      'U.M. General': a.unidad_medida_general_descripcion,
      'Categoría': a.categoria_descripcion || '-',
      'Estado': a.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': formatDate(a.fecha_creacion),
      'Usuario Creación': a.usuario_creacion_nombre || '-',
      'Fecha Modificación': formatDate(a.fecha_modificacion),
      'Usuario Modificación': a.usuario_modificacion_nombre || '-'
    }));
    exportToExcel(dataToExport, 'articulos_milla7');
  };

  const confirmDelete = (articulo) => {
    setDeleteModal({ show: true, articulo });
  };

  const handleDelete = async () => {
    const id = deleteModal.articulo.id;
    setDeleteModal({ show: false, articulo: null });
    try {
      await axios.delete(`/api/core/articulos/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      
      const isRole1 = user?.role_id == 1 || user?.is_superuser;
      if (isRole1) {
          setArticulos(articulos.map(a => a.id === id ? { ...a, eliminado: true } : a));
      } else {
          setArticulos(articulos.filter(a => a.id !== id));
      }
    } catch (err) {
      alert('Error al eliminar el artículo');
    }
  };

  if (loading) return <div style={{textAlign:'center',padding:'50px',fontSize:'18px',color:'#666'}}>Cargando artículos...</div>;
  if (error) return <div style={{textAlign:'center',padding:'50px',fontSize:'18px',color:'#d32f2f'}}>{error}</div>;

  return (
    <div style={{padding:'30px',maxWidth:'1600px',margin:'0 auto',fontFamily:'Inter, sans-serif'}}>
      <h1 style={{fontSize:'28px',fontWeight:'700',color:'#1565c0',marginBottom:'25px',display:'flex',alignItems:'center'}}><i className="fa fa-box" style={{marginRight:'10px'}}></i>Gestión de Artículos</h1>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'25px',gap:'15px',flexWrap:'wrap'}}>
        <input type="text" placeholder="🔍 Buscar artículo..." style={{padding:'12px 18px',border:'2px solid #e0e0e0',borderRadius:'10px',fontSize:'15px',width:'300px',outline:'none',boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}} value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
        <div style={{display:'flex',gap:'12px'}}>
          <button onClick={()=>router.push('/maestras/articulos/create')} style={{padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.1)',background:'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',color:'#fff'}}><i className="fa fa-plus" style={{marginRight:'8px'}}></i>Crear Artículo</button>
          
          <MasterImportControl 
            modelName="articulos"
            headers={['Codigo', 'Descripcion', 'UM General', 'UM Intermedia', 'UM Especial', 'Categoria']}
            onSuccess={() => {
                // Refresh list logic
                const fetchArticulos = async () => {
                    try {
                        setLoading(true);
                        const response = await axios.get('/api/core/articulos/', { headers: { Authorization: `Bearer ${token}` } });
                        setArticulos(response.data);
                    } catch (err) { setError('Error al recargar.'); } finally { setLoading(false); }
                };
                fetchArticulos();
            }}
          />

          <button onClick={handleExport} style={{padding:'12px 24px',border:'1px solid #2e7d32',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',background:'#e8f5e9',color:'#2e7d32'}}><i className="fa fa-file-excel" style={{marginRight:'8px'}}></i>Exportar</button>
        </div>
      </div>

      <div style={{backgroundColor:'#fff',borderRadius:'15px',boxShadow:'0 5px 20px rgba(0,0,0,0.05)',overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'1000px'}}>
            <thead>
              <tr>
                <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('codigo')}>Código {sortColumn==='codigo'&&(sortDirection==='asc'?'▲':'▼')}</th>
                <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('descripcion')}>Descripción {sortColumn==='descripcion'&&(sortDirection==='asc'?'▲':'▼')}</th>
                <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('unidad_medida_general_descripcion')}>U.M. General {sortColumn==='unidad_medida_general_descripcion'&&(sortDirection==='asc'?'▲':'▼')}</th>
                <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('categoria_descripcion')}>Categoría {sortColumn==='categoria_descripcion'&&(sortDirection==='asc'?'▲':'▼')}</th>
                <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('estado')}>Estado {sortColumn==='estado'&&(sortDirection==='asc'?'▲':'▼')}</th>
                <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('fecha_creacion')}>F. Creación {sortColumn==='fecha_creacion'&&(sortDirection==='asc'?'▲':'▼')}</th>
                <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}} onClick={()=>handleSort('usuario_creacion_nombre')}>Usuario {sortColumn==='usuario_creacion_nombre'&&(sortDirection==='asc'?'▲':'▼')}</th>
                <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticulos.map(a=>(
                <tr key={a.id} style={{borderBottom:'1px solid #f0f0f0'}}>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333',fontWeight:'600'}}>{a.codigo || '-'}</td>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333',fontWeight:'500'}}>{a.descripcion}</td>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{a.unidad_medida_general_descripcion}</td>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{a.categoria_descripcion || '-'}</td>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>
                    {a.eliminado ? (
                        <span style={{padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',display:'inline-block',background:'#ffcdd2',color:'#b71c1c'}}>Eliminado</span>
                    ) : (
                        <span style={{padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',display:'inline-block',background:a.estado?'#e8f5e9':'#ffebee',color:a.estado?'#2e7d32':'#c62828'}}>{a.estado?'Activo':'Inactivo'}</span>
                    )}
                  </td>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{formatDate(a.fecha_creacion)}</td>
                  <td style={{padding:'16px',fontSize:'14px',color:'#333'}}>{a.usuario_creacion_nombre || '-'}</td>
                  <td style={{padding:'16px',display:'flex',gap:'10px'}}>
                    {!a.eliminado && (
                        <div style={{display:'flex',gap:'10px'}}>
                        <button onClick={()=>router.push(`/maestras/articulos/${a.id}/edit`)} style={{padding:'8px',border:'none',background:'transparent',color:'#1976d2',cursor:'pointer',fontSize:'16px'}} title="Editar"><i className="fa fa-edit"></i></button>
                        <button onClick={()=>confirmDelete(a)} style={{padding:'8px',border:'none',background:'transparent',color:'#d32f2f',cursor:'pointer',fontSize:'16px'}} title="Eliminar"><i className="fa fa-trash"></i></button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredArticulos.length===0 && (
                <tr>
                  <td colSpan="8" style={{padding:'40px',textAlign:'center',color:'#666',fontSize:'15px',fontStyle:'italic'}}>
                    <i className="fa fa-search" style={{fontSize:'24px',display:'block',marginBottom:'10px',color:'#ccc'}}></i>
                    No se encontraron artículos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal de Confirmación */}
      {deleteModal.show && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div style={{background:'#fff',borderRadius:'16px',padding:'32px',maxWidth:'450px',width:'90%',boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <div style={{width:'64px',height:'64px',margin:'0 auto 16px',background:'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <i className="fa fa-exclamation-triangle" style={{fontSize:'32px',color:'#fff'}}></i>
              </div>
              <h2 style={{fontSize:'24px',fontWeight:'700',color:'#333',margin:'0 0 8px 0'}}>¿Eliminar Artículo?</h2>
              <p style={{fontSize:'15px',color:'#666',margin:0}}>¿Está seguro de eliminar el artículo <strong>{deleteModal.articulo?.descripcion}</strong>?</p>
              <p style={{fontSize:'13px',color:'#999',marginTop:'8px'}}>Esta acción no se puede deshacer.</p>
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={()=>setDeleteModal({show:false,articulo:null})} style={{flex:1,padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',background:'#ef5350',color:'#fff',transition:'all 0.3s ease'}}>
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
