'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function TiposNotificacionPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/maestras/tipos-notificacion/', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentId) {
        await axios.put(`/api/maestras/tipos-notificacion/${currentId}/`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/maestras/tipos-notificacion/', formData, {
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
    setFormData({ nombre: item.nombre, descripcion: item.descripcion });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro de eliminar?")) return;
    try {
        await axios.delete(`/api/maestras/tipos-notificacion/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
    } catch (e) { alert("Error eliminando"); }
  };

  const openNew = () => {
      setCurrentId(null);
      setFormData({ nombre: '', descripcion: '' });
      setModalOpen(true);
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#1565c0' }}>🔔 Tipos de Notificación</h2>
        <button onClick={openNew} style={{ background: '#1565c0', color: 'white', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer' }}>
            + Nuevo Tipo
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f5f5f5' }}>
                <tr>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Nombre</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Descripción</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {data.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '15px' }}>{item.nombre}</td>
                        <td style={{ padding: '15px' }}>{item.descripcion}</td>
                        <td style={{ padding: '15px' }}>
                            <button onClick={() => handleEdit(item)} style={{ marginRight: '10px', cursor:'pointer', border:'none', background:'none', color:'#1976d2' }}>✏️</button>
                            <button onClick={() => handleDelete(item.id)} style={{ cursor:'pointer', border:'none', background:'none', color:'#d32f2f' }}>🗑️</button>
                        </td>
                    </tr>
                ))}
                {data.length === 0 && <tr><td colSpan="3" style={{padding:'20px', textAlign:'center'}}>Sin registros</td></tr>}
            </tbody>
        </table>
      </div>

      {modalOpen && (
          <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <form onSubmit={handleSubmit} style={{ background:'white', padding:'30px', borderRadius:'12px', width:'400px' }}>
                  <h3>{currentId ? 'Editar' : 'Crear'} Tipo</h3>
                  <div style={{ marginBottom: '15px' }}>
                      <label style={{ display:'block', marginBottom:'5px' }}>Nombre</label>
                      <input 
                        required
                        style={{ width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'4px' }}
                        value={formData.nombre}
                        onChange={e => setFormData({...formData, nombre: e.target.value})}
                      />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                      <label style={{ display:'block', marginBottom:'5px' }}>Descripción</label>
                      <input 
                        style={{ width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'4px' }}
                        value={formData.descripcion}
                        onChange={e => setFormData({...formData, descripcion: e.target.value})}
                      />
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
