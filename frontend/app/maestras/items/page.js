'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ItemsPage() {
  const { token, isAuthenticated, user, permissions } = useAuth();
  const router = useRouter();
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState('modulo'); // 'modulo', 'pagina', 'tab'
  const [actionType, setActionType] = useState('create'); // 'create', 'edit'
  const [currentItem, setCurrentItem] = useState(null); // Data for editing or parent for creating
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estados de expansión
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedPages, setExpandedPages] = useState({});
  const [formErrors, setFormErrors] = useState({}); // P10
  const [isSubmitting, setIsSubmitting] = useState(false); // P11
  
  // Permissions Logic
  const pagePermissions = permissions.find(p => {
    const name = p.nombre.toLowerCase();
    return name.includes('item') || name.includes('ítem') || name.includes('menu');
  }) || {};
  const canCreate = pagePermissions.crear;
  const canEdit = pagePermissions.editar;
  const canDelete = pagePermissions.borrar;

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }
    fetchTree();
  }, [token, isAuthenticated]);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/maestras/modulos/admin_tree/', { headers: { Authorization: `Bearer ${token}` } });
      setTree(res.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar la estructura del menú');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (id) => setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  const togglePage = (id) => setExpandedPages(prev => ({ ...prev, [id]: !prev[id] }));

  const openModal = (level, type, item = null, parent = null) => {
    setCurrentLevel(level);
    setActionType(type);
    setCurrentItem(item); // If edit, item is the obj. If create, item might be parent or null.
    
    // Init form data
    if (type === 'create') {
      const baseData = { descripcion: '', order: 0, icono: '', route: '', estado: true };
      if (level === 'pagina') baseData.modulo = parent.id;
      if (level === 'tab') baseData.pagina = parent.id;
      setFormData(baseData);
    } else {
      // Edit
      const data = { ...item };
      // Normalizamos nombres de campos para el form
      if (level === 'modulo') {
        data.descripcion = item.descripcion_modulo;
      } else if (level === 'pagina') {
        data.descripcion = item.descripcion_pages;
      } else if (level === 'tab') {
        data.descripcion = item.descripcion_tabs;
      }
      setFormData(data);
    }
    setModalOpen(true);
    setError(null);
    setSuccess(null);
    setFormErrors({}); // Clean errors on open
  };

  // P10: Inline Validation
  const handleBlur = (field, value) => {
      let errors = { ...formErrors };
      
      // 1. Descripción validation
      if (field === 'descripcion') {
          if (!value || value.trim().length < 3) {
              errors.descripcion = 'Mínimo 3 caracteres.';
          } else if (value.length > 100) {
              errors.descripcion = 'Máximo 100 caracteres.';
          } else {
              delete errors.descripcion;
          }
      }

      // 2. Orden validation
      if (field === 'order' && currentLevel !== 'tab') {
          if (value === '' || value < 0) {
              errors.order = 'Campo requerido (min 0).';
          } else if (value > 999) {
              errors.order = 'Máximo 999.';
          } else {
              delete errors.order;
          }
      }

      // 3. Ruta URL validation
      if (field === 'route') {
          // Auto-format: lowercase, replace spaces
          const formatted = value.toLowerCase().replace(/\s+/g, '-');
          setFormData(prev => ({ ...prev, route: formatted }));
          
          if (!formatted.startsWith('/')) {
              errors.route = 'Debe comenzar con /';
          } else if (!/^\/[a-z0-9/-]*$/.test(formatted)) {
              errors.route = 'Solo minúsculas, números y guiones.';
          } else {
              delete errors.route;
          }
      }

      // 4. Icono validation
      if (field === 'icono') {
          if (value && !value.startsWith('fa fa-')) {
              errors.icono = "La clase debe comenzar con 'fa fa-'.";
          } else {
              delete errors.icono;
          }
      }
      setFormErrors(errors);
  };

  // Helper for character count color
  const getCharCountColor = () => {
      const len = formData.descripcion?.length || 0;
      if (len >= 100) return '#d32f2f';
      if (len >= 80) return '#f57c00';
      return '#999';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Final validation before submit
    const desc = formData.descripcion || '';
    const ord = formData.order;
    const rt = formData.route; // Only for pages/tabs if applicable? Assuming 'route' is mainly for Pages/Modules
    
    let errors = { ...formErrors };
    if(desc.length < 3 || desc.length > 100) errors.descripcion = 'Longitud inválida (3-100).';
    if(currentLevel !== 'tab' && (ord < 0 || ord > 999)) errors.order = 'Orden inválido.';
    if(currentLevel === 'pagina' && rt && !rt.startsWith('/')) errors.route = 'Ruta inválida.';

    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setError("Corrija los errores antes de guardar.");
        return;
    }
    
    setIsSubmitting(true);
    let url = '';
    let payload = { ...formData };
    
    // Map generic form fields back to model specific fields
    if (currentLevel === 'modulo') {
        url = '/api/maestras/modulos/';
        payload.descripcion_modulo = payload.descripcion;
    } else if (currentLevel === 'pagina') {
        url = '/api/maestras/paginas/';
        payload.descripcion_pages = payload.descripcion;
    } else if (currentLevel === 'tab') {
        url = '/api/maestras/tabs/';
        payload.descripcion_tabs = payload.descripcion;
    }
    delete payload.descripcion; // Cleanup

    try {
      if (actionType === 'create') {
        await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess('Item creado correctamente');
      } else {
        const idField = currentLevel === 'modulo' ? 'id' : (currentLevel === 'pagina' ? 'id' : 'id_tab');
        await axios.put(`${url}${currentItem[idField]}/`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess('Item actualizado correctamente');
      }
      setModalOpen(false);
      fetchTree();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false); // P11 End
    }
  };

  const handleDelete = async (level, id) => {
    if (!confirm('¿Está seguro de eliminar este item? Esta acción no se puede deshacer.')) return;
    let url = '';
    if (level === 'modulo') url = `/api/maestras/modulos/${id}/`;
    if (level === 'pagina') url = `/api/maestras/paginas/${id}/`;
    if (level === 'tab') url = `/api/maestras/tabs/${id}/`;

    try {
      await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Item eliminado');
      fetchTree();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
        console.error(err);
        setError('Error al eliminar');
    }
  };

  if (loading) return <div style={{padding:'20px'}}>Cargando estructura...</div>;

  return (
    <div style={{padding:'30px',maxWidth:'1200px',margin:'0 auto',fontFamily:'Inter, sans-serif'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'30px'}}>
        <h1 style={{fontSize:'28px',fontWeight:'700',color:'#1565c0',margin:0}}>Gestión de Items de Menú</h1>
        {canCreate && (
        <button onClick={() => openModal('modulo', 'create')} style={{padding:'10px 20px',background:'#4caf50',color:'#fff',border:'none',borderRadius:'8px',fontWeight:'600',cursor:'pointer'}}>
          <i className="fa fa-plus" style={{marginRight:'5px'}}></i> Nuevo Módulo
        </button>
        )}
      </div>

      {error && <div style={{background:'#ffebee',color:'#c62828',padding:'15px',borderRadius:'8px',marginBottom:'20px'}}>{error}</div>}
      {success && <div style={{background:'#e8f5e9',color:'#2e7d32',padding:'15px',borderRadius:'8px',marginBottom:'20px'}}>{success}</div>}

      <div style={{background:'#fff',borderRadius:'12px',padding:'30px',boxShadow:'0 4px 12px rgba(0,0,0,0.08)'}}>
        {tree.map(modulo => (
          <div key={modulo.id} style={{marginBottom:'15px',border:'1px solid #e0e0e0',borderRadius:'8px',overflow:'hidden'}}>
            {/* Header Modulo */}
            <div style={{background:'#f5f5f5',padding:'15px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',cursor:'pointer',flex:1}} onClick={() => toggleModule(modulo.id)}>
                <i className={`fa fa-chevron-${expandedModules[modulo.id]?'down':'right'}`} style={{marginRight:'10px',color:'#666',width:'20px'}}></i>
                <span style={{fontWeight:'700',fontSize:'16px',color:'#1565c0'}}>{modulo.descripcion_modulo}</span>
                {!modulo.estado && <span style={{marginLeft:'10px',fontSize:'12px',background:'#ffebee',color:'#c62828',padding:'2px 8px',borderRadius:'10px'}}>Inactivo</span>}
              </div>
              <div style={{display:'flex',gap:'10px'}}>
                {canCreate && (
                <button onClick={() => openModal('pagina', 'create', null, modulo)} style={{background:'#e3f2fd',border:'none',color:'#1565c0',padding:'5px 10px',borderRadius:'4px',cursor:'pointer',fontSize:'12px'}}>
                    <i className="fa fa-plus"></i> Página
                </button>
                )}
                {canEdit && (
                <button onClick={() => openModal('modulo', 'edit', modulo)} style={{background:'#e3f2fd',border:'none',color:'#1565c0',padding:'5px 10px',borderRadius:'4px',cursor:'pointer',fontSize:'12px'}}>
                    <i className="fa fa-edit"></i>
                </button>
                )}
                {canDelete && (
                <button onClick={() => handleDelete('modulo', modulo.id)} style={{background:'#ffebee',border:'none',color:'#c62828',padding:'5px 10px',borderRadius:'4px',cursor:'pointer',fontSize:'12px'}}>
                    <i className="fa fa-trash"></i>
                </button>
                )}
              </div>
            </div>

            {/* Listado Paginas */}
            {expandedModules[modulo.id] && (
              <div style={{padding:'10px 10px 10px 30px',background:'#fff'}}>
                {modulo.paginas?.length === 0 && <div style={{color:'#999',fontSize:'14px',fontStyle:'italic'}}>Sin páginas</div>}
                {modulo.paginas?.map(pagina => (
                  <div key={pagina.id} style={{marginBottom:'10px',borderLeft:'2px solid #e0e0e0',paddingLeft:'15px'}}>
                     <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0'}}>
                        <div style={{display:'flex',alignItems:'center',cursor:'pointer',flex:1}} onClick={() => togglePage(pagina.id)}>
                            <i className={`fa fa-chevron-${expandedPages[pagina.id]?'down':'right'}`} style={{marginRight:'10px',color:'#999',fontSize:'12px',width:'15px'}}></i>
                            <span style={{fontWeight:'600',fontSize:'15px',color:'#444'}}>{pagina.descripcion_pages}</span>
                            {!pagina.estado && <span style={{marginLeft:'10px',fontSize:'11px',background:'#ffebee',color:'#c62828',padding:'2px 6px',borderRadius:'8px'}}>Inactivo</span>}
                        </div>
                        <div style={{display:'flex',gap:'8px'}}>
                            {canCreate && (
                            <button onClick={() => openModal('tab', 'create', null, pagina)} style={{background:'#f5f5f5',border:'none',color:'#1565c0',padding:'4px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'11px'}}>
                                <i className="fa fa-plus"></i> Tab
                            </button>
                            )}
                            {canEdit && (
                            <button onClick={() => openModal('pagina', 'edit', pagina)} style={{background:'#f5f5f5',border:'none',color:'#666',padding:'4px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'11px'}}>
                                <i className="fa fa-edit"></i>
                            </button>
                            )}
                            {canDelete && (
                            <button onClick={() => handleDelete('pagina', pagina.id)} style={{background:'#fff0f0',border:'none',color:'#c62828',padding:'4px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'11px'}}>
                                <i className="fa fa-trash"></i>
                            </button>
                            )}
                        </div>
                     </div>

                     {/* Listado Tabs */}
                     {expandedPages[pagina.id] && (
                         <div style={{padding:'5px 5px 5px 25px'}}>
                             {pagina.tabs?.length === 0 && <div style={{color:'#ccc',fontSize:'13px',fontStyle:'italic'}}>Sin tabs</div>}
                             {pagina.tabs?.map(tab => (
                                 <div key={tab.id_tab} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 0',borderBottom:'1px dashed #eee'}}>
                                     <div style={{fontSize:'14px',color:'#666'}}>
                                         <i className="fa fa-tag" style={{marginRight:'8px',fontSize:'10px',color:'#bbb'}}></i>
                                         {tab.descripcion_tabs}
                                         {!tab.estado && <span style={{marginLeft:'8px',fontSize:'10px',color:'#c62828'}}>(Inactivo)</span>}
                                     </div>
                                     <div style={{display:'flex',gap:'5px'}}>
                                        {canEdit && (
                                        <button onClick={() => openModal('tab', 'edit', tab)} style={{background:'transparent',border:'none',color:'#666',cursor:'pointer',fontSize:'11px'}}>
                                            <i className="fa fa-edit"></i>
                                        </button>
                                        )}
                                        {canDelete && (
                                        <button onClick={() => handleDelete('tab', tab.id_tab)} style={{background:'transparent',border:'none',color:'#c62828',cursor:'pointer',fontSize:'11px'}}>
                                            <i className="fa fa-trash"></i>
                                        </button>
                                        )}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modalOpen && (
          <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.5)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:1000}}>
              <div style={{background:'#fff',padding:'30px',borderRadius:'12px',width:'400px',boxShadow:'0 10px 25px rgba(0,0,0,0.2)'}}>
                  <h2 style={{marginTop:0,color:'#1565c0'}}>{actionType === 'create' ? 'Crear' : 'Editar'} {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}</h2>
                  <form onSubmit={handleSave}>
                      <div className="input-group floating-label-group">
                          <input 
                            id="desc"
                            type="text" 
                            value={formData.descripcion || ''} 
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val.length <= 100) setFormData({...formData, descripcion: val});
                            }}
                            onBlur={(e) => handleBlur('descripcion', e.target.value)}
                            required 
                            className="input-field has-floating-label"
                            placeholder=" "
                            style={{
                                borderColor: formErrors.descripcion ? '#d32f2f' : (!formErrors.descripcion && formData.descripcion?.length >= 3 ? '#4caf50' : '#ccc'),
                                paddingRight: '40px'
                            }}
                          />
                          <label htmlFor="desc" className="floating-label">Nombre del Módulo / Descripción</label>
                          
                          {/* Char Counter & Validation Icon */}
                          <div style={{position:'absolute', right:'10px', top:'15px', fontSize:'11px', color: getCharCountColor(), display:'flex', alignItems:'center', gap:'5px'}}>
                              {!formErrors.descripcion && formData.descripcion?.length >= 3 && <i className="fa fa-check" style={{color:'#4caf50'}}></i>}
                              {formData.descripcion?.length || 0}/100
                          </div>

                          {formErrors.descripcion && <span style={{color:'#d32f2f',fontSize:'12px',marginTop:'4px',display:'block'}}>{formErrors.descripcion}</span>}
                      </div>

                      <div style={{marginBottom:'15px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'15px'}}>
                          <div className="input-group floating-label-group">
                               {currentLevel !== 'tab' ? (
                                  <>
                                  <input 
                                    id="order"
                                    type="number" 
                                    value={formData.order || 0} 
                                    onChange={(e) => {
                                        // P10: Block non-numbers implemented by input type=number, but add manual check if needed
                                        const val = e.target.value;
                                        if (val.length <= 3) setFormData({...formData, order: val}); // Simple length check, validation in blur
                                    }} 
                                    onBlur={(e) => handleBlur('order', e.target.value)}
                                    className="input-field has-floating-label"
                                    placeholder=" "
                                    style={{borderColor: formErrors.order ? '#d32f2f' : '#ccc'}}
                                  />
                                  <label htmlFor="order" className="floating-label">Orden (0-999)</label>
                                  {formErrors.order && <span style={{color:'#d32f2f',fontSize:'12px',marginTop:'4px',display:'block'}}>{formErrors.order}</span>}
                                  </>
                               ) : <div style={{padding:'10px',color:'#999',fontSize:'13px', paddingTop:'20px'}}>Orden Automático</div>}
                          </div>
                           <div className="input-group floating-label-group">
                              <input 
                                id="route"
                                type="text" 
                                value={formData.route || ''} 
                                onChange={(e) => {
                                    // P10: Real-time formatting (lowercase, spaces to hyphen)
                                    const val = e.target.value.toLowerCase().replace(/\s/g, '-');
                                    setFormData({...formData, route: val});
                                }} 
                                onBlur={(e) => handleBlur('route', e.target.value)}
                                className="input-field has-floating-label"
                                placeholder=" "
                                style={{borderColor: formErrors.route ? '#d32f2f' : '#ccc'}}
                              />
                              <label htmlFor="route" className="floating-label">Ruta URL</label>
                              {formErrors.route && <span style={{color:'#d32f2f',fontSize:'12px',marginTop:'4px',display:'block'}}>{formErrors.route}</span>}
                          </div>
                      </div>

                      <div className="input-group floating-label-group">
                          <input 
                            id="icono"
                            type="text" 
                            value={formData.icono || ''} 
                            onChange={(e) => setFormData({...formData, icono: e.target.value})} 
                            onBlur={(e) => handleBlur('icono', e.target.value)}
                            className="input-field has-floating-label"
                            placeholder=" "
                            style={{borderColor: formErrors.icono ? '#d32f2f' : '#ccc'}}
                          />
                          <label htmlFor="icono" className="floating-label">Icono (Clase CSS)</label>
                          {formErrors.icono && <span style={{color:'#d32f2f',fontSize:'12px',marginTop:'4px',display:'block'}}>{formErrors.icono}</span>}
                          <div style={{fontSize:'11px',color:'#666',marginTop:'5px'}}>
                             Ej: <code>fa fa-user</code>. 
                             <a href="https://fontawesome.com/v4/icons/" target="_blank" rel="noopener noreferrer" style={{color:'#1565c0',marginLeft:'5px'}}>Ver lista</a>
                          </div>
                      </div>

                      <div style={{marginBottom:'20px', marginTop:'15px'}}>
                          <label style={{display:'flex',alignItems:'center',cursor:'pointer'}}>
                              <input type="checkbox" checked={formData.estado !== false} onChange={(e) => setFormData({...formData, estado: e.target.checked})} style={{width:'18px',height:'18px',marginRight:'10px'}} />
                              Activo
                          </label>
                      </div>
                      <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
                          <button type="button" onClick={() => setModalOpen(false)} style={{padding:'10px 20px',background:'#d32f2f',color:'#fff',border:'none',borderRadius:'6px',cursor:'pointer'}} disabled={isSubmitting}>Cancelar</button>
                          
                          <div title={Object.keys(formErrors).length > 0 ? "Completa los campos requeridos correctamente" : ""}>
                            <button 
                                type="submit" 
                                style={{
                                    padding:'10px 20px',
                                    background: isSubmitting || Object.keys(formErrors).length > 0 ? '#90caf9' : '#1565c0',
                                    color:'#fff',
                                    border:'none',
                                    borderRadius:'6px',
                                    cursor: isSubmitting || Object.keys(formErrors).length > 0 ? 'not-allowed' : 'pointer', 
                                    display:'flex', 
                                    alignItems:'center', 
                                    gap:'8px'
                                }} 
                                disabled={isSubmitting || Object.keys(formErrors).length > 0}
                            >
                                {isSubmitting && <i className="fa fa-spinner fa-spin"></i>}
                                {isSubmitting ? 'Guardando...' : 'Guardar'}
                            </button>
                          </div>
                      </div>
                  </form>
              </div>
          </div>
      )}
      <style jsx>{`
        .input-group { position: relative; margin-bottom: 20px; }
        .input-field { 
           width: 100%;
           padding: 15px 10px 5px 10px; 
           height: 45px; 
           border: 1px solid #ccc;
           border-radius: 6px;
           box-sizing: border-box;
           font-size: 14px;
        }
        .input-field:focus { border-color: #1565c0; outline: none; }
        
        .input-field:placeholder-shown + .floating-label {
           top: 12px;
           font-size: 14px;
           color: #666;
           left: 10px;
        }
        .floating-label {
           position: absolute;
           left: 10px;
           top: 2px;
           font-size: 10px;
           color: #666;
           transition: all 0.2s ease;
           pointer-events: none;
           background: transparent;
        }
        .input-field:focus + .floating-label,
        .input-field:not(:placeholder-shown) + .floating-label {
           top: 2px;
           font-size: 10px;
           font-weight: 600;
           color: #1565c0;
        }
        .input-field::placeholder { color: transparent; }
      `}</style>
    </div>
  );
}
