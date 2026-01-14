'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function CreateUsuarioPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '', first_name: '', last_name: '', role_id: '', phone_number: '', is_active: true, permisos: [], clientes: [] });
  const [roles, setRoles] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  // Helper to check for superuser (ID 1)
  const canDelete = user?.is_superuser || user?.role_id === 1;

  useEffect(() => {
    if (!isAuthenticated || !token) { router.push('/'); return; }
    const fetchData = async () => {
      try {
        const [rolesRes, tabsRes, clientesRes] = await Promise.all([
          axios.get('/api/users/usuarios/roles_disponibles/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/users/usuarios/permisos_disponibles/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/core/clientes/', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setRoles(rolesRes.data);
        setTabs(tabsRes.data);
        setClientes(clientesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [isAuthenticated, token, router]);

  useEffect(() => {
    setPasswordMatch(formData.password === formData.password2 || formData.password2 === '');
  }, [formData.password, formData.password2]);

  // Nuevo efecto: Cargar permisos del rol seleccionado
  useEffect(() => {
    const fetchRolePermissions = async () => {
      if (!formData.role_id) return;
      
      try {
        // Opcional: Mostrar indicador de "Cargando configuración de rol..."
        const response = await axios.get(`/api/maestras/roles/${formData.role_id}/permisos/`, { headers: { Authorization: `Bearer ${token}` } });
        const rolePermisos = response.data;
        
        // Mapear respuesta a estructura requerida por el estado
        // Solo incluimos permisos marcados como activos/asignados al rol
        const newPermisos = rolePermisos
          .filter(p => p.ver || p.crear || p.editar || p.borrar) // Solo si tiene algún acceso
          .map(p => ({
            tab_id: p.tab_id,
            ver: p.ver,
            crear: p.crear,
            editar: p.editar,
            borrar: p.borrar
          }));

        setFormData(prev => ({ ...prev, permisos: newPermisos }));
      } catch (err) {
        console.error('Error fetching role permissions:', err);
        // Podríamos mostrar un toast o aviso, pero por ahora solo log.
      }
    };

    fetchRolePermissions();
  }, [formData.role_id, token]); // Se ejecuta cuando cambia role_id

  const handleChange = (e) => { const { name, value, type, checked } = e.target; setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); };

  const handleClienteChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(parseInt(options[i].value));
    }
    setFormData(prev => ({ ...prev, clientes: selected }));
  };

  const handlePermisoChange = (tabId, field) => {
    setFormData(prev => {
      const permisos = [...prev.permisos];
      const existingIndex = permisos.findIndex(p => p.tab_id === tabId);
      
      if (existingIndex >= 0) {
        permisos[existingIndex] = { ...permisos[existingIndex], [field]: !permisos[existingIndex][field] };
        if (!permisos[existingIndex].ver && !permisos[existingIndex].crear && !permisos[existingIndex].editar && !permisos[existingIndex].borrar) {
          permisos.splice(existingIndex, 1);
        }
      } else {
        permisos.push({ tab_id: tabId, ver: field === 'ver', crear: field === 'crear', editar: field === 'editar', borrar: field === 'borrar' });
      }
      
      return { ...prev, permisos };
    });
  };



// ... (existing code)

  // --- NEW: Global Toggle Logic ---
  const handleGlobalToggle = () => {
    // Check if ALL tabs have ALL permissions
    const allTabsIds = tabs.map(t => t.id_tab);
    
    // Check coverage
    let allCovered = true;
    if (formData.permisos.length < allTabsIds.length) {
      allCovered = false;
    } else {
      // Check individual fields
      for (const tId of allTabsIds) {
        const p = formData.permisos.find(jp => jp.tab_id === tId);
        if (!p || !p.ver || !p.crear || !p.editar || !p.borrar) {
          allCovered = false;
          break;
        }
      }
    }

    const title = allCovered ? '¿Desasignar Todo?' : '¿Asignar Todo?';
    const text = allCovered 
      ? 'Se quitarán todos los permisos de todos los módulos.' 
      : 'Se asignarán permisos completos (Ver, Crear, Editar, Borrar) a todos los módulos.';
    const confirmBtnColor = allCovered ? '#d33' : '#3085d6';
    const confirmBtnText = allCovered ? 'Sí, quitar todo' : 'Sí, asignar todo';
    const icon = allCovered ? 'warning' : 'info';

    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: confirmBtnColor,
      cancelButtonColor: '#aaa',
      confirmButtonText: confirmBtnText,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (allCovered) {
          // Remove all
          setFormData(prev => ({ ...prev, permisos: [] }));
          Swal.fire('Desasignado', 'Se han quitado todos los permisos.', 'success');
        } else {
          // Assign all
          const newPerms = tabs.map(t => ({
            tab_id: t.id_tab,
            ver: true,
            crear: true,
            editar: true,
            borrar: true
          }));
          setFormData(prev => ({ ...prev, permisos: newPerms }));
          Swal.fire('Asignado', 'Se han asignado todos los permisos.', 'success');
        }
      }
    });
  };

  // --- NEW: Row Toggle Logic ---
  const handleRowToggle = (tabId) => {
    setFormData(prev => {
      const permisos = [...prev.permisos];
      const index = permisos.findIndex(p => p.tab_id === tabId);
      
      let pObj = index >= 0 ? permisos[index] : null;

      // Check if full
      const isFull = pObj && pObj.ver && pObj.crear && pObj.editar && pObj.borrar;

      if (isFull) {
        // Toggle OFF -> Remove completely
        if (index >= 0) {
            permisos.splice(index, 1);
        }
      } else {
        // Toggle ON -> ensure object exists and set all true
        if (index >= 0) {
            permisos[index] = { tab_id: tabId, ver: true, crear: true, editar: true, borrar: true };
        } else {
            permisos.push({ tab_id: tabId, ver: true, crear: true, editar: true, borrar: true });
        }
      }
      return { ...prev, permisos };
    });
  };


  const groupedTabs = tabs.reduce((acc, tab) => {
    const moduloNombre = tab.pagina?.modulo || 'Sin módulo';
    const paginaNombre = tab.pagina?.descripcion_pages || 'Sin página';
    if (!acc[moduloNombre]) acc[moduloNombre] = {};
    if (!acc[moduloNombre][paginaNombre]) acc[moduloNombre][paginaNombre] = [];
    acc[moduloNombre][paginaNombre].push(tab);
    return acc;
  }, {});

  // Helper helper to check row status for icon
  const getRowStatus = (tabId) => {
    const p = formData.permisos.find(x => x.tab_id === tabId);
    if (p && p.ver && p.crear && p.editar && p.borrar) return true; // Full
    return false;
  };


  const getPermisoValue = (tabId, field) => {
    const permiso = formData.permisos.find(p => p.tab_id === tabId);
    return permiso ? permiso[field] : false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!passwordMatch) { setError("Las contraseñas no coinciden"); setLoading(false); return; }
    try {
      await axios.post('/api/users/usuarios/', formData, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
      router.push('/maestras/usuarios');
    } catch (err) {
      setError('Error al crear usuario');
      console.error(err);
      Swal.fire('Error', 'No se pudo crear el usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{padding:'20px'}}>Cargando...</div>;
  if (error) return <div style={{padding:'20px',color:'red'}}>{error}</div>;

  return (
    <div className="create-user-container">
      <form onSubmit={handleSubmit}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                <label style={{fontSize:'14px',fontWeight:'600'}}>Permisos por Tab</label>
                <button 
                  type="button" 
                  onClick={handleGlobalToggle}
                  style={{
                    background: '#e3f2fd', 
                    color: '#1565c0', 
                    border: '1px solid #1565c0', 
                    padding: '5px 12px', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}
                >
                  <i className="fa fa-list-check" style={{marginRight:'5px'}}></i>
                  Asignar Todo (General)
                </button>
            </div>
            
            <div style={{border:'2px solid #e0e0e0',borderRadius:'8px',padding:'16px',maxHeight:'400px',overflowY:'auto'}}>
              {Object.keys(groupedTabs).map(moduloNombre => (
                <div key={moduloNombre} style={{marginBottom:'20px'}}>
                  <h3 style={{fontSize:'16px',fontWeight:'700',color:'#1565c0',marginBottom:'10px',borderBottom:'2px solid #1565c0',paddingBottom:'5px'}}>{moduloNombre}</h3>
                  {Object.keys(groupedTabs[moduloNombre]).map(paginaNombre => (
                    <div key={paginaNombre} style={{marginLeft:'15px',marginBottom:'15px'}}>
                      <h4 style={{fontSize:'14px',fontWeight:'600',color:'#666',marginBottom:'8px'}}>{paginaNombre}</h4>
                      <table style={{width:'100%',marginLeft:'15px',fontSize:'13px'}}>
                        <thead>
                          <tr style={{borderBottom:'1px solid #e0e0e0'}}>
                            <th style={{textAlign:'left',padding:'8px',fontWeight:'600'}}>Tab</th>
                            <th style={{textAlign:'center',padding:'8px',fontWeight:'600',width:'50px'}}>Todo</th> {/* NEW COL */}
                            <th style={{textAlign:'center',padding:'8px',fontWeight:'600',width:'80px'}}>Ver</th>
                            <th style={{textAlign:'center',padding:'8px',fontWeight:'600',width:'80px'}}>Crear</th>
                            <th style={{textAlign:'center',padding:'8px',fontWeight:'600',width:'80px'}}>Editar</th>
                            <th style={{textAlign:'center',padding:'8px',fontWeight:'600',width:'80px'}}>Borrar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedTabs[moduloNombre][paginaNombre].map(tab => {
                             const isRowFull = getRowStatus(tab.id_tab);
                             return (
                            <tr key={tab.id_tab} style={{borderBottom:'1px solid #f0f0f0'}}>
                              <td style={{padding:'8px'}}>{tab.descripcion_tabs}</td>
                              {/* NEW ROW BUTTON */}
                              <td style={{textAlign:'center',padding:'8px'}}>
                                <button 
                                  type="button" 
                                  onClick={() => handleRowToggle(tab.id_tab)}
                                  title={isRowFull ? "Desmarcar Fila" : "Marcar Fila"}
                                  style={{
                                    border: 'none', 
                                    background: 'transparent', 
                                    cursor: 'pointer', 
                                    color: isRowFull ? '#d32f2f' : '#1565c0',
                                    fontSize: '16px'
                                  }}
                                >
                                  <i className={isRowFull ? "fa fa-times-circle" : "fa fa-check-double"}></i>
                                </button>
                              </td> 
                              <td style={{textAlign:'center',padding:'8px'}}><input type="checkbox" checked={getPermisoValue(tab.id_tab, 'ver')} onChange={() => handlePermisoChange(tab.id_tab, 'ver')} style={{width:'16px',height:'16px',cursor:'pointer'}} /></td>
                              <td style={{textAlign:'center',padding:'8px'}}><input type="checkbox" checked={getPermisoValue(tab.id_tab, 'crear')} onChange={() => handlePermisoChange(tab.id_tab, 'crear')} style={{width:'16px',height:'16px',cursor:'pointer'}} /></td>
                              <td style={{textAlign:'center',padding:'8px'}}><input type="checkbox" checked={getPermisoValue(tab.id_tab, 'editar')} onChange={() => handlePermisoChange(tab.id_tab, 'editar')} style={{width:'16px',height:'16px',cursor:'pointer'}} /></td>
                              <td style={{textAlign:'center',padding:'8px'}}><input type="checkbox" checked={getPermisoValue(tab.id_tab, 'borrar')} onChange={() => handlePermisoChange(tab.id_tab, 'borrar')} style={{width:'16px',height:'16px',cursor:'pointer'}} /></td>
                            </tr>
                          )})}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p style={{fontSize:'12px',color:'#666',marginTop:'8px'}}>Permisos seleccionados: {formData.permisos.length}</p>
          </div>
          
          <div style={{marginBottom:'25px'}}><label style={{display:'flex',alignItems:'center',cursor:'pointer'}}><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} style={{width:'20px',height:'20px'}} /><span style={{marginLeft:'8px',fontSize:'15px'}}>Activo</span></label></div>
          <div style={{display:'flex',gap:'12px'}}>
            <button type="submit" disabled={loading || !passwordMatch} style={{flex:1,padding:'12px 24px',border:'none',borderRadius:'8px',fontSize:'15px',fontWeight:'600',cursor:'pointer',background:'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',color:'#fff',opacity:(loading || !passwordMatch)?0.6:1}}>{loading?<><i className="fa fa-spinner fa-spin" style={{marginRight:'8px'}}></i>Guardando...</>:<><i className="fa fa-save" style={{marginRight:'8px'}}></i>Guardar Usuario</>}</button>
            <button type="button" onClick={()=>router.push('/maestras/usuarios')} style={{padding:'12px 24px',border:'none',borderRadius:'8px',fontSize:'15px',fontWeight:'600',cursor:'pointer',background:'#ef5350',color:'#fff'}} disabled={loading}><i className="fa fa-times" style={{marginRight:'8px'}}></i>Cancelar</button>
          </div>
        </form>
      </div>

  );
}
