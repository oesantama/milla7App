'use client';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function PermisosRolesPage() {
  const [view, setView] = useState('list'); // 'list' | 'edit'
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null); // Object {id_rol, descripcion_rol}
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id_rol', direction: 'asc' });
  
  const { token, isAuthenticated, user, permissions } = useAuth();
  const router = useRouter();

  // Helper to check for superuser (ID 1)
  // Permissions logic
  // Permissions logic
  const pagePermissions = permissions.find(p => p.nombre.toLowerCase().includes('rol') || p.nombre.toLowerCase().includes('permiso')) || {};
  const canCreate = pagePermissions.crear;
  const canEdit = pagePermissions.editar;
  const canDelete = pagePermissions.borrar;

  // Cargar roles al inicio
  useEffect(() => {
    if (!isAuthenticated || !token) { router.push('/'); return; }
    fetchRoles();
  }, [isAuthenticated, token, router]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/maestras/roles/', { headers: { Authorization: `Bearer ${token}` } });
      setRoles(response.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  // Cargar permisos cuando se selecciona un rol
  useEffect(() => {
    if (selectedRole && view === 'edit') {
      const fetchPermisos = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api/maestras/roles/${selectedRole.id_rol}/permisos/`, { headers: { Authorization: `Bearer ${token}` } });
          setPermisos(response.data);
        } catch (err) {
          console.error('Error fetching permissions:', err);
          setError('Error al cargar permisos del rol');
        } finally {
          setLoading(false);
        }
      };
      fetchPermisos();
    }
  }, [selectedRole, view, token]);

  const handleEdit = (role) => {
    setSelectedRole(role);
    setView('edit');
    setSuccessMessage(null);
    setError(null);
  };

  const handleBack = () => {
    setView('list');
    setSelectedRole(null);
    setPermisos([]);
    setSuccessMessage(null);
    setError(null);
  };

  const handlePermisoChange = (tabId, field) => {
    setPermisos(prev => prev.map(p => {
      if (p.tab_id === tabId) {
        return { ...p, [field]: !p[field] };
      }
      return p;
    }));
  };

  const toggleRoleStatus = async () => {
    if (!selectedRole) return;
    const newStatus = !selectedRole.estado;
    try {
      await axios.patch(`/api/maestras/roles/${selectedRole.id_rol}/`, { estado: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedRole(prev => ({ ...prev, estado: newStatus }));
      setRoles(prev => prev.map(r => r.id_rol === selectedRole.id_rol ? { ...r, estado: newStatus } : r));
      setSuccessMessage(`Rol ${newStatus ? 'activado' : 'inactivado'} correctamente`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating role status:', err);
      setError('Error al actualizar estado del rol');
    }
  };

  const savePermisos = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setSuccessMessage(null);
    setError(null);
    try {
      await axios.post(`/api/maestras/roles/${selectedRole.id_rol}/permisos/`, { permisos }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccessMessage('Permisos actualizados correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving permissions:', err);
      setError('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const downloadExcel = async () => {
    try {
      const response = await axios.get('/api/maestras/roles/exportar_excel/', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'roles_permisos.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError('Error al descargar reporte');
    }
  };

  // Filtrar y ordenar roles
  const filteredRoles = roles.filter(r => 
    r.descripcion_rol.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Agrupar permisos
  const groupedPermisos = permisos.reduce((acc, p) => {
    const modulo = p.modulo || 'Otros';
    const pagina = p.pagina || 'Otras';
    if (!acc[modulo]) acc[modulo] = {};
    if (!acc[modulo][pagina]) acc[modulo][pagina] = [];
    acc[modulo][pagina].push(p);
    return acc;
  }, {});

  if (!isAuthenticated) return null;

  return (
    <div style={{padding:'30px',maxWidth:'1200px',margin:'0 auto',fontFamily:'Inter, sans-serif'}}>
      
      {/* HEADER */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'30px'}}>
        <h1 style={{fontSize:'28px',fontWeight:'700',color:'#1565c0',margin:0}}>
          <i className="fa fa-shield-alt" style={{marginRight:'10px'}}></i>
          {view === 'list' ? 'Gestión de Permisos por Rol' : `Editando Permisos: ${selectedRole?.descripcion_rol}`}
        </h1>
        {view === 'edit' && (
          <button onClick={handleBack} style={{padding:'10px 20px',background:'#f5f5f5',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',fontWeight:'600',color:'#666'}}>
            <i className="fa fa-arrow-left" style={{marginRight:'8px'}}></i>Volver a la lista
          </button>
        )}
      </div>

      {error && <div style={{background:'#ffebee',color:'#c62828',padding:'15px',borderRadius:'8px',marginBottom:'20px'}}><i className="fa fa-exclamation-circle" style={{marginRight:'8px'}}></i>{error}</div>}
      {successMessage && <div style={{background:'#e8f5e9',color:'#2e7d32',padding:'15px',borderRadius:'8px',marginBottom:'20px'}}><i className="fa fa-check-circle" style={{marginRight:'8px'}}></i>{successMessage}</div>}

      {/* VISTA DE LISTA */}
      {view === 'list' && (
        <div style={{background:'#fff',borderRadius:'12px',padding:'30px',boxShadow:'0 4px 12px rgba(0,0,0,0.08)'}}>
          <div style={{marginBottom:'20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{display:'flex',gap:'10px'}}>
              <input 
                type="text" 
                placeholder="Buscar Rol..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{padding:'10px',borderRadius:'8px',border:'1px solid #ddd',width:'300px'}}
              />
            </div>
            <button onClick={downloadExcel} style={{padding:'10px 20px',background:'#4caf50',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'600',display:'flex',alignItems:'center'}}>
              <i className="fa fa-file-excel" style={{marginRight:'8px'}}></i>Exportar Excel
            </button>
          </div>
          
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'15px'}}>
            <thead>
              <tr style={{background:'#f9f9f9',borderBottom:'2px solid #eee',textAlign:'left'}}>
                <th onClick={()=>handleSort('id_rol')} style={{padding:'15px',fontWeight:'600',color:'#444',cursor:'pointer'}}>ID {sortConfig.key==='id_rol' && (sortConfig.direction==='asc'?'▲':'▼')}</th>
                <th onClick={()=>handleSort('descripcion_rol')} style={{padding:'15px',fontWeight:'600',color:'#444',cursor:'pointer'}}>Descripción del Rol {sortConfig.key==='descripcion_rol' && (sortConfig.direction==='asc'?'▲':'▼')}</th>
                <th onClick={()=>handleSort('estado')} style={{padding:'15px',fontWeight:'600',color:'#444',cursor:'pointer'}}>Estado {sortConfig.key==='estado' && (sortConfig.direction==='asc'?'▲':'▼')}</th>
                <th style={{padding:'15px',fontWeight:'600',color:'#444',textAlign:'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map(rol => (
                <tr key={rol.id_rol} style={{borderBottom:'1px solid #eee'}}>
                  <td style={{padding:'15px',color:'#666'}}>#{rol.id_rol}</td>
                  <td style={{padding:'15px',fontWeight:'600'}}>{rol.descripcion_rol}</td>
                  <td style={{padding:'15px'}}><span style={{background:rol.estado?'#e8f5e9':'#ffebee',color:rol.estado?'#2e7d32':'#c62828',padding:'4px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:'600'}}>{rol.estado ? 'Activo' : 'Inactivo'}</span></td>
                  <td style={{padding:'15px',textAlign:'center'}}>
                    <button onClick={() => handleEdit(rol)} style={{padding:'8px 16px',background:'#e3f2fd',color:'#1565c0',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'600',fontSize:'13px'}}>
                      <i className="fa fa-edit" style={{marginRight:'5px'}}></i>Gestionar Permisos
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRoles.length === 0 && (
                <tr><td colSpan="4" style={{padding:'30px',textAlign:'center',color:'#999'}}>No se encontraron roles</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VISTA DE EDICIÓN */}
      {view === 'edit' && !loading && (
        <div style={{background:'#fff',borderRadius:'12px',padding:'30px',boxShadow:'0 4px 12px rgba(0,0,0,0.08)'}}>
          
          {/* Role Info & Status Toggle */}
          <div style={{background:'#f5faff',border:'1px solid #b3d1ff',borderRadius:'8px',padding:'20px',marginBottom:'25px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h3 style={{margin:'0 0 5px 0',color:'#1565c0',fontSize:'18px'}}>Rol: {selectedRole?.descripcion_rol}</h3>
              <p style={{margin:0,color:'#666',fontSize:'14px'}}>Estado actual: <span style={{fontWeight:'700',color:selectedRole?.estado?'#2e7d32':'#c62828'}}>{selectedRole?.estado ? 'ACTIVO' : 'INACTIVO'}</span></p>
            </div>
            <button 
              onClick={toggleRoleStatus}
              style={{
                padding:'10px 20px',
                borderRadius:'6px',
                border:'none',
                cursor:'pointer',
                fontWeight:'600',
                background: selectedRole?.estado ? '#ffebee' : '#e8f5e9',
                color: selectedRole?.estado ? '#c62828' : '#2e7d32',
                border: `1px solid ${selectedRole?.estado ? '#ef9a9a' : '#a5d6a7'}`
              }}
            >
              {selectedRole?.estado ? <><i className="fa fa-ban" style={{marginRight:'8px'}}></i>Inactivar Rol</> : <><i className="fa fa-check" style={{marginRight:'8px'}}></i>Activar Rol</>}
            </button>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
            <h2 style={{fontSize:'20px',fontWeight:'700',color:'#333',margin:0}}>Configurar Accesos y CRUD</h2>
            <div style={{display:'flex', gap:'10px'}}>
               <button 
                  onClick={() => {
                    // Check if ALL permissions are currently active
                    const allActive = permisos.every(p => p.estado && p.ver && p.crear && p.editar && p.borrar);
                    const actionText = allActive ? 'QUITAR' : 'ASIGNAR';
                    const confirmNav = allActive ? 'Sí, quitar todo' : 'Sí, asignar todo';
                    
                    Swal.fire({
                      title: `¿${actionText} permiso TOTAL?`,
                      text: `Esto ${allActive ? 'desactivará' : 'activará'} TODOS los permisos para TODOS los módulos.`,
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: allActive ? '#d32f2f' : '#1565c0',
                      cancelButtonColor: '#d32f2f',
                      confirmButtonText: confirmNav,
                      cancelButtonText: 'Cancelar'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        const newState = !allActive;
                        setPermisos(prev => prev.map(p => ({
                          ...p, estado: newState, ver: newState, crear: newState, editar: newState, borrar: newState
                        })));
                        Swal.fire(
                          allActive ? '¡Permisos Removidos!' : '¡Asignado!',
                          'La configuración ha sido actualizada. Recuerde Guardar Cambios.',
                          'success'
                        )
                      }
                    })
                  }}
                  style={{padding:'10px 20px',background:'#e3f2fd',color:'#1565c0',border:'1px solid #90caf9',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}
               >
                 <i className="fa fa-sync-alt" style={{marginRight:'5px'}}></i>Alternar Todo (General)
               </button>
               <button onClick={savePermisos} disabled={saving} style={{padding:'12px 30px',background:'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',color:'#fff',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'600',cursor:'pointer',opacity:saving?0.7:1,boxShadow:'0 4px 6px rgba(21,101,192,0.3)'}}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
            </div>
          </div>

          <div style={{maxHeight:'600px',overflowY:'auto',border:'1px solid #e0e0e0',borderRadius:'8px'}}>
            {Object.keys(groupedPermisos).map(modulo => (
              <div key={modulo}>
                <div style={{background:'#f5f5f5',padding:'15px 20px',borderBottom:'1px solid #e0e0e0',fontSize:'16px',fontWeight:'700',color:'#1565c0'}}>{modulo}</div>
                {Object.keys(groupedPermisos[modulo]).map(pagina => (
                  <div key={pagina} style={{padding:'15px 20px',borderBottom:'1px solid #f0f0f0'}}>
                    <div style={{fontSize:'15px',fontWeight:'600',color:'#444',marginBottom:'10px',display:'flex',alignItems:'center'}}><i className="fa fa-file" style={{marginRight:'8px',fontSize:'12px',color:'#999'}}></i>{pagina}</div>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'14px'}}>
                      <thead>
                        <tr style={{background:'#fafafa',color:'#666'}}>
                          <th style={{textAlign:'left',padding:'10px',fontWeight:'600',border:'1px solid #eee'}}>Tab / Funcionalidad</th>
                          <th style={{textAlign:'center',padding:'10px',fontWeight:'600',width:'80px',border:'1px solid #eee'}}>Activo</th>
                          <th style={{textAlign:'center',padding:'10px',fontWeight:'600',width:'80px',border:'1px solid #eee'}}>Ver</th>
                          <th style={{textAlign:'center',padding:'10px',fontWeight:'600',width:'80px',border:'1px solid #eee'}}>Crear</th>
                          <th style={{textAlign:'center',padding:'10px',fontWeight:'600',width:'80px',border:'1px solid #eee'}}>Editar</th>
                          <th style={{textAlign:'center',padding:'10px',fontWeight:'600',width:'80px',border:'1px solid #eee'}}>Borrar</th>
                          <th style={{textAlign:'center',padding:'10px',fontWeight:'600',width:'80px',border:'1px solid #eee'}}>Todo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedPermisos[modulo][pagina].map(p => (
                          <tr key={p.tab_id} style={{borderBottom:'1px solid #eee'}}>
                            <td style={{padding:'10px',border:'1px solid #eee'}}>{p.tab}</td>
                            <td style={{textAlign:'center',padding:'10px',border:'1px solid #eee'}}><input type="checkbox" checked={p.estado} onChange={() => handlePermisoChange(p.tab_id, 'estado')} style={{width:'18px',height:'18px',cursor:'pointer'}} /></td>
                            <td style={{textAlign:'center',padding:'10px',border:'1px solid #eee'}}><input type="checkbox" checked={p.ver} onChange={() => handlePermisoChange(p.tab_id, 'ver')} style={{width:'18px',height:'18px',cursor:'pointer'}} /></td>
                            <td style={{textAlign:'center',padding:'10px',border:'1px solid #eee'}}><input type="checkbox" checked={p.crear} onChange={() => handlePermisoChange(p.tab_id, 'crear')} style={{width:'18px',height:'18px',cursor:'pointer'}} /></td>
                            <td style={{textAlign:'center',padding:'10px',border:'1px solid #eee'}}><input type="checkbox" checked={p.editar} onChange={() => handlePermisoChange(p.tab_id, 'editar')} style={{width:'18px',height:'18px',cursor:'pointer'}} /></td>
                            <td style={{textAlign:'center',padding:'10px',border:'1px solid #eee'}}><input type="checkbox" checked={p.borrar} onChange={() => handlePermisoChange(p.tab_id, 'borrar')} disabled={!canDelete} style={{width:'18px',height:'18px',cursor:canDelete?'pointer':'not-allowed',opacity:canDelete?1:0.5}} /></td>
                            <td style={{textAlign:'center',padding:'10px',border:'1px solid #eee'}}>
                                <button 
                                    onClick={() => {
                                        setPermisos(prev => prev.map(item => {
                                            if (item.tab_id === p.tab_id) {
                                                // Check if this specific row is fully active
                                                const isRowFull = item.estado && item.ver && item.crear && item.editar && item.borrar;
                                                const newState = !isRowFull; // Toggle
                                                
                                                return { ...item, estado: newState, ver: newState, crear: newState, editar: newState, borrar: newState };
                                            }
                                            return item;
                                        }));
                                    }}
                                    title="Alternar todos los permisos de esta fila"
                                    style={{background:'none',border:'none',cursor:'pointer',color:'#1565c0',fontSize:'16px'}}
                                >
                                    {/* Visual feedback: Double check if full, empty circle or semi-check if not? Let's keep check-double but maybe change color or icon based on state? 
                                        User asked for functionality, keeping the icon simple is safer, but I will make it dynamic if possible or just keep check-double as 'Toggle Action'.
                                        Actually, check-double implies 'Select All'. If already selected, maybe 'Times' or 'Minus'? 
                                        The user prompt implies the logic is paramount. I'll stick to the logic requested.
                                    */}
                                    <i className={`fa ${p.estado && p.ver && p.crear && p.editar && p.borrar ? 'fa-times-circle text-red-500' : 'fa-check-double'}`}></i>
                                </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{marginTop:'20px',textAlign:'right'}}>
             <button onClick={savePermisos} disabled={saving} style={{padding:'12px 30px',background:'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',color:'#fff',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'600',cursor:'pointer',opacity:saving?0.7:1,boxShadow:'0 4px 6px rgba(21,101,192,0.3)'}}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
          </div>
        </div>
      )}
      
      {loading && view==='edit' && <div style={{textAlign:'center',padding:'40px',fontSize:'18px',color:'#666'}}><i className="fa fa-spinner fa-spin" style={{marginRight:'10px'}}></i>Cargando permisos...</div>}

    </div>
  );
}
