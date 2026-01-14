'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import MasterImportControl from '../../components/MasterImportControl';

export default function UnidadesMedidaPage() {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_creacion', direction: 'desc' });
  const [deleteModal, setDeleteModal] = useState({ show: false, unidad: null });
  const { token, isAuthenticated, hasPermission, user } = useAuth();
  const router = useRouter();

  // Estilos (Reutilizando el diseño existente)
  const styles = {
    container: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '24px', fontWeight: '700', color: '#1565c0', display: 'flex', alignItems: 'center' },
    createButton: { background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(21, 101, 192, 0.2)', transition: 'transform 0.2s', fontWeight: '600' },
    searchContainer: { display: 'flex', gap: '15px', marginBottom: '25px', background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
    searchInput: { flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' },
    exportButton: { background: '#2e7d32', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' },
    tableContainer: { background: '#fff', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { background: '#f8f9fa', padding: '16px', textAlign: 'left', fontWeight: '600', color: '#444', borderBottom: '2px solid #edf2f7', cursor: 'pointer' },
    td: { padding: '16px', borderBottom: '1px solid #edf2f7', color: '#333' },
    badge: (active) => ({ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: active ? '#e3f2fd' : '#ffebee', color: active ? '#1565c0' : '#c62828' }),
    actionButton: (color) => ({ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '6px', color: color, transition: 'background 0.2s' }),
    loading: { textAlign: 'center', padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', color: '#666' },
  };

  useEffect(() => {
    if (!isAuthenticated || !token) { router.push('/'); return; }
    fetchUnidades();
  }, [isAuthenticated, token, router]);

  const fetchUnidades = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/core/unidades-medida/', { headers: { Authorization: `Bearer ${token}` } });
      setUnidades(res.data);
    } catch (error) {
      console.error("Error fetching units", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (unidad) => {
    setDeleteModal({ show: true, unidad });
  };

  const handleDelete = async () => {
    const id = deleteModal.unidad.id;
    setDeleteModal({ show: false, unidad: null });
    try {
      await axios.delete(`/api/core/unidades-medida/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      
      const isRole1 = user?.role_id == 1 || user?.is_superuser;
      if (isRole1) {
          setUnidades(unidades.map(item => item.id === id ? { ...item, eliminado: true } : item));
      } else {
          setUnidades(unidades.filter(item => item.id !== id));
      }
    } catch (error) {
        alert('Error al eliminar');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortData = (data) => {
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const exportToExcel = () => {
    const dataToExport = filteredData.map(item => ({
      ID: item.id,
      Descripción: item.descripcion,
      Abreviatura: item.abreviatura || '-',
      Estado: item.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': new Date(item.fecha_creacion).toLocaleDateString(),
      'Usuario Creación': item.usuario_creacion_nombre || '-',
      'Fecha Modificación': new Date(item.fecha_modificacion).toLocaleDateString(),
      'Usuario Modificación': item.usuario_modificacion_nombre || '-'
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Unidades");
    XLSX.writeFile(wb, "UnidadesMedida.xlsx");
  };

  const filteredData = sortData(unidades.filter(item =>
    item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  if (!isAuthenticated) return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
            <i className="fa fa-ruler" style={{ marginRight: '12px' }}></i>
            Unidades de Medida
        </div>
        {/* Permission check normally here, simplified for now */}
        <button style={{...styles.createButton, background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)'}} onClick={() => router.push('/maestras/unidades_medida/create')}>
            <i className="fa fa-plus"></i> Nueva Unidad
        </button>
      </div>

      {/* Search & Export */}
      <div style={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="🔍 Buscar unidad..." 
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <MasterImportControl 
            modelName="unidades_medida"
            headers={['Descripcion', 'Abreviatura']}
            onSuccess={() => {
                const fetchUnidades = async () => {
                    try {
                        setLoading(true);
                        const res = await axios.get('/api/core/unidades-medida/', { headers: { Authorization: `Bearer ${token}` } });
                        setUnidades(res.data);
                    } catch (error) {} finally { setLoading(false); }
                };
                fetchUnidades();
            }}
          />

          <button onClick={exportToExcel} style={styles.exportButton}>
            <i className="fa fa-file-excel"></i> Exportar
          </button>
        </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loading}>
            <i className="fa fa-spinner fa-spin" style={{ fontSize: '32px', color: '#1565c0' }}></i>
            <p>Cargando unidades...</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
          <table style={{...styles.table, minWidth: '1000px'}}>
            <thead>
              <tr>
                <th style={styles.th} onClick={() => handleSort('descripcion')}>Descripción <i className="fa fa-sort" style={{fontSize:'12px', marginLeft:'5px'}}></i></th>
                <th style={styles.th} onClick={() => handleSort('abreviatura')}>Abreviatura <i className="fa fa-sort" style={{fontSize:'12px', marginLeft:'5px'}}></i></th>
                <th style={styles.th} onClick={() => handleSort('estado')}>Estado <i className="fa fa-sort" style={{fontSize:'12px', marginLeft:'5px'}}></i></th>
                <th style={styles.th} onClick={() => handleSort('fecha_creacion')}>F. Creación <i className="fa fa-sort" style={{fontSize:'12px', marginLeft:'5px'}}></i></th>
                <th style={styles.th} onClick={() => handleSort('usuario_creacion_nombre')}>Usr. Creación <i className="fa fa-sort" style={{fontSize:'12px', marginLeft:'5px'}}></i></th>
                <th style={styles.th} onClick={() => handleSort('fecha_modificacion')}>F. Modificación <i className="fa fa-sort" style={{fontSize:'12px', marginLeft:'5px'}}></i></th>
                <th style={styles.th} onClick={() => handleSort('usuario_modificacion_nombre')}>Usr. Modificación <i className="fa fa-sort" style={{fontSize:'12px', marginLeft:'5px'}}></i></th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} style={{ ':hover': { background: '#f8f9fa' } }}>
                  <td style={styles.td}>{item.descripcion}</td>
                  <td style={styles.td}>{item.abreviatura || '-'}</td>
                  <td style={styles.td}>
                    {item.eliminado ? (
                        <span style={{padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#ffcdd2', color: '#b71c1c'}}>Eliminado</span>
                    ) : (
                        <span style={styles.badge(item.estado)}>
                        {item.estado ? 'Activo' : 'Inactivo'}
                        </span>
                    )}
                  </td>
                  <td style={styles.td}>{new Date(item.fecha_creacion).toLocaleDateString()}</td>
                  <td style={styles.td}>{item.usuario_creacion_nombre || '-'}</td>
                  <td style={styles.td}>{new Date(item.fecha_modificacion).toLocaleDateString()}</td>
                  <td style={styles.td}>{item.usuario_modificacion_nombre || '-'}</td>
                  <td style={styles.td}>
                    {!item.eliminado && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            title="Editar"
                            style={styles.actionButton('#1976d2')}
                            onClick={() => router.push(`/maestras/unidades_medida/${item.id}/edit`)}
                        >
                            <i className="fa fa-edit"></i>
                        </button>
                        <button
                            title="Eliminar"
                            style={styles.actionButton('#d32f2f')}
                            onClick={() => confirmDelete(item)}
                        >
                            <i className="fa fa-trash"></i>
                        </button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                    No se encontraron registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      {deleteModal.show && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div style={{background:'#fff',borderRadius:'16px',padding:'32px',maxWidth:'450px',width:'90%',boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <div style={{width:'64px',height:'64px',margin:'0 auto 16px',background:'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <i className="fa fa-exclamation-triangle" style={{fontSize:'32px',color:'#fff'}}></i>
              </div>
              <h2 style={{fontSize:'24px',fontWeight:'700',color:'#333',margin:'0 0 8px 0'}}>¿Eliminar Unidad?</h2>
              <p style={{fontSize:'15px',color:'#666',margin:0}}>¿Está seguro de eliminar la unidad <strong>{deleteModal.unidad?.descripcion}</strong>?</p>
              <p style={{fontSize:'13px',color:'#999',marginTop:'8px'}}>Esta acción no se puede deshacer.</p>
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={()=>setDeleteModal({show:false,unidad:null})} style={{flex:1,padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',background:'#ef5350',color:'#fff',transition:'all 0.3s ease'}}>
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
