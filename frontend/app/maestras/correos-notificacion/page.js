'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CorreosNotificacionPage() {
  const [data, setData] = useState([]);
  const [tipos, setTipos] = useState([]); // List of notification types
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ 
      correo: '', 
      nombre_contacto: '', 
      tipo_novedad: '', 
      estado: true 
  });

  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
        fetchData();
        fetchTipos();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/correos-notificacion/', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTipos = async () => {
      try {
        const res = await axios.get('/api/maestras/tipos-notificacion/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setTipos(res.data);
      } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentId) {
        await axios.put(`/api/correos-notificacion/${currentId}/`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/correos-notificacion/', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Error guardando datos");
    }
  };

  const handleEdit = (item) => {
    setCurrentId(item.id);
    setFormData({ 
        correo: item.correo, 
        nombre_contacto: item.nombre_contacto || '', 
        tipo_novedad: item.tipo_novedad, 
        estado: item.estado 
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro de eliminar?")) return;
    try {
        await axios.delete(`/api/correos-notificacion/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
    } catch (e) { alert("Error eliminando"); }
  };

  const openNew = () => {
      setCurrentId(null);
      setFormData({ correo: '', nombre_contacto: '', tipo_novedad: '', estado: true });
      setModalOpen(true);
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#1565c0' }}>✉️ Correos de Notificación</h2>
        <button onClick={openNew} style={{ background: '#1565c0', color: 'white', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer' }}>
            + Nuevo Correo
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f5f5f5' }}>
                <tr>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Nombre/Usuario</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Correo</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Tipo Novedad</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Estado</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {data.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '15px' }}>{item.nombre_contacto || '-'}</td>
                        <td style={{ padding: '15px' }}>{item.correo}</td>
                        <td style={{ padding: '15px' }}>
                            <span style={{ background:'#e3f2fd', color:'#1565c0', padding:'4px 8px', borderRadius:'12px', fontSize:'12px' }}>
                                {item.tipo_novedad_nombre || 'N/A'}
                            </span>
                        </td>
                         <td style={{ padding: '15px' }}>
                            <span style={{ 
                                background: item.estado ? '#e8f5e9' : '#ffebee', 
                                color: item.estado ? '#2e7d32' : '#c62828', 
                                padding:'4px 8px', borderRadius:'12px', fontSize:'12px' 
                            }}>
                                {item.estado ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                            <button onClick={() => handleEdit(item)} style={{ marginRight: '10px', cursor:'pointer', border:'none', background:'none', color:'#1976d2' }}>✏️</button>
                            <button onClick={() => handleDelete(item.id)} style={{ cursor:'pointer', border:'none', background:'none', color:'#d32f2f' }}>🗑️</button>
                        </td>
                    </tr>
                ))}
                {data.length === 0 && <tr><td colSpan="5" style={{padding:'20px', textAlign:'center'}}>Sin registros</td></tr>}
            </tbody>
        </table>
      </div>

      {modalOpen && (
          <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <form onSubmit={handleSubmit} style={{ background:'white', padding:'30px', borderRadius:'12px', width:'400px' }}>
                  <h3>{currentId ? 'Editar' : 'Crear'} Correo</h3>
                  
                  <div style={{ marginBottom: '15px' }}>
                      <label style={{ display:'block', marginBottom:'5px' }}>Nombre Contacto</label>
                      <input 
                        style={{ width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'4px' }}
                        value={formData.nombre_contacto}
                        onChange={e => setFormData({...formData, nombre_contacto: e.target.value})}
                      />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                      <label style={{ display:'block', marginBottom:'5px' }}>Correo Electrónico</label>
                      <input 
                        type="email" required
                        style={{ width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'4px' }}
                        value={formData.correo}
                        onChange={e => setFormData({...formData, correo: e.target.value})}
                      />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                      <label style={{ display:'block', marginBottom:'5px' }}>Tipo Novedad</label>
                      <select 
                        style={{ width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'4px' }}
                        value={formData.tipo_novedad}
                        onChange={e => setFormData({...formData, tipo_novedad: e.target.value})}
                      >
                          <option value="">-- Seleccione --</option>
                          {tipos.map(t => (
                              <option key={t.id} value={t.id}>{t.nombre}</option>
                          ))}
                      </select>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                      <label style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <input 
                            type="checkbox"
                            checked={formData.estado}
                            onChange={e => setFormData({...formData, estado: e.target.checked})}
                          />
                          Activo
                      </label>
                  </div>

                  <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                      <button type="button" onClick={() => setModalOpen(false)} style={{ padding:'8px 16px', background:'#e53935', color:'white', border:'none', borderRadius:'4px', cursor:'pointer' }}>Cancelar</button>
                      <button type="submit" style={{ padding:'8px 16px', background:'#1565c0', color:'white', border:'none', borderRadius:'4px', cursor:'pointer' }}>Guardar</button>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
}
