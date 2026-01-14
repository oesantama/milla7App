'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';

export default function EditClientePage() {
  const [formData, setFormData] = useState({ nombre: '', logo: null, estado: true });
  const [currentLogo, setCurrentLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    if (!isAuthenticated || !token) { router.push('/'); return; }
    const fetchCliente = async () => {
      try {
        const response = await axios.get(`/api/core/clientes/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
        setFormData({ nombre: response.data.nombre, logo: null, estado: response.data.estado });
        setCurrentLogo(response.data.logo);
      } catch (err) {
        setError('Error al cargar el cliente');
      } finally {
        setLoading(false);
      }
    };
    fetchCliente();
  }, [isAuthenticated, token, id, router]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) { setError('El nombre es requerido'); return; }
    setSaving(true); setError(null);
    try {
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('estado', formData.estado);
      if (formData.logo) data.append('logo', formData.logo);
      
      await axios.put(`/api/core/clientes/${id}/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push('/maestras/clientes');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el cliente');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'60px',gap:'15px'}}><i className="fa fa-spinner fa-spin" style={{fontSize:'32px',color:'#1565c0'}}></i><p>Cargando cliente...</p></div>;

  return (
    <div style={{padding:'30px',maxWidth:'800px',margin:'0 auto',fontFamily:'Inter, sans-serif'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'30px'}}>
        <h1 style={{fontSize:'28px',fontWeight:'700',color:'#1565c0',margin:0,display:'flex',alignItems:'center'}}><i className="fa fa-edit" style={{marginRight:'10px'}}></i>Editar Cliente</h1>
        <button onClick={()=>router.push('/maestras/clientes')} style={{padding:'10px 20px',background:'#f5f5f5',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',fontWeight:'600',color:'#666'}}><i className="fa fa-arrow-left" style={{marginRight:'8px'}}></i>Volver</button>
      </div>
      <div style={{background:'#fff',borderRadius:'12px',padding:'40px',boxShadow:'0 4px 12px rgba(0,0,0,0.08)'}}>
        <form onSubmit={handleSubmit}>
          {error&&<div style={{background:'#ffebee',color:'#c62828',padding:'12px 16px',borderRadius:'8px',marginBottom:'20px',display:'flex',alignItems:'center'}}><i className="fa fa-exclamation-circle" style={{marginRight:'8px'}}></i>{error}</div>}
          <div style={{marginBottom:'25px'}}><label style={{display:'block',marginBottom:'8px',fontSize:'14px',fontWeight:'600',color:'#333'}}>Nombre <span style={{color:'#d32f2f'}}>*</span></label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} style={{width:'100%',padding:'12px 16px',border:'2px solid #e0e0e0',borderRadius:'8px',fontSize:'15px',outline:'none',boxSizing:'border-box'}} required /></div>
          <div style={{marginBottom:'25px'}}>
            <label style={{display:'block',marginBottom:'8px',fontSize:'14px',fontWeight:'600',color:'#333'}}>Logo (Imagen)</label>
            {currentLogo && <div style={{marginBottom:'10px'}}><img src={currentLogo} alt="Logo actual" style={{width:'100px',height:'100px',objectFit:'contain',border:'2px solid #e0e0e0',borderRadius:'8px',padding:'8px'}} onError={(e)=>{e.target.style.display='none'}} /><p style={{fontSize:'12px',color:'#666',marginTop:'5px'}}>Logo actual</p></div>}
            <input type="file" name="logo" onChange={handleChange} accept="image/*" style={{width:'100%',padding:'12px 16px',border:'2px solid #e0e0e0',borderRadius:'8px',fontSize:'15px',outline:'none',boxSizing:'border-box'}} />
            <p style={{fontSize:'12px',color:'#666',marginTop:'5px'}}>Deja vacío para mantener el logo actual</p>
          </div>
          <div style={{marginBottom:'25px'}}><label style={{display:'flex',alignItems:'center',fontSize:'15px',color:'#333',cursor:'pointer'}}><input type="checkbox" name="estado" checked={formData.estado} onChange={handleChange} style={{width:'20px',height:'20px',cursor:'pointer'}} /><span style={{marginLeft:'8px'}}>Activo</span></label></div>
          <div style={{display:'flex',gap:'12px',marginTop:'30px'}}>
            <button type="submit" disabled={saving} style={{padding:'12px 24px',border:'none',borderRadius:'8px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',color:'#fff',flex:1,opacity:saving?0.6:1}}>{saving?<><i className="fa fa-spinner fa-spin" style={{marginRight:'8px'}}></i>Guardando...</>:<><i className="fa fa-save" style={{marginRight:'8px'}}></i>Guardar Cambios</>}</button>
            <button type="button" onClick={()=>router.push('/maestras/clientes')} style={{padding:'12px 24px',border:'none',borderRadius:'8px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',background:'#ef5350',color:'#fff'}} disabled={saving}><i className="fa fa-times" style={{marginRight:'8px'}}></i>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
