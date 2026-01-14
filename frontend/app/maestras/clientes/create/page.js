'use client';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CreateClientePage() {
  const [formData, setFormData] = useState({ nombre: '', logo: null, estado: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

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
    setLoading(true); setError(null);
    try {
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('estado', formData.estado);
      if (formData.logo) data.append('logo', formData.logo);
      
      await axios.post('/api/core/clientes/', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push('/maestras/clientes');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el cliente');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) { router.push('/'); return null; }

  return (
    <div style={{padding:'30px',maxWidth:'800px',margin:'0 auto',fontFamily:'Inter, sans-serif'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'30px'}}>
        <h1 style={{fontSize:'28px',fontWeight:'700',color:'#1565c0',margin:0,display:'flex',alignItems:'center'}}><i className="fa fa-plus-circle" style={{marginRight:'10px'}}></i>Crear Nuevo Cliente</h1>
        <button onClick={()=>router.push('/maestras/clientes')} style={{padding:'10px 20px',background:'#f5f5f5',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',fontWeight:'600',color:'#666'}}><i className="fa fa-arrow-left" style={{marginRight:'8px'}}></i>Volver</button>
      </div>
      <div style={{background:'#fff',borderRadius:'12px',padding:'40px',boxShadow:'0 4px 12px rgba(0,0,0,0.08)'}}>
        <form onSubmit={handleSubmit}>
          {error&&<div style={{background:'#ffebee',color:'#c62828',padding:'12px 16px',borderRadius:'8px',marginBottom:'20px',display:'flex',alignItems:'center'}}><i className="fa fa-exclamation-circle" style={{marginRight:'8px'}}></i>{error}</div>}
          <div style={{marginBottom:'25px'}}><label style={{display:'block',marginBottom:'8px',fontSize:'14px',fontWeight:'600',color:'#333'}}>Nombre <span style={{color:'#d32f2f'}}>*</span></label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre del cliente" style={{width:'100%',padding:'12px 16px',border:'2px solid #e0e0e0',borderRadius:'8px',fontSize:'15px',outline:'none',boxSizing:'border-box'}} required /></div>
          <div style={{marginBottom:'25px'}}><label style={{display:'block',marginBottom:'8px',fontSize:'14px',fontWeight:'600',color:'#333'}}>Logo (Imagen)</label><input type="file" name="logo" onChange={handleChange} accept="image/*" style={{width:'100%',padding:'12px 16px',border:'2px solid #e0e0e0',borderRadius:'8px',fontSize:'15px',outline:'none',boxSizing:'border-box'}} /></div>
          <div style={{marginBottom:'25px'}}><label style={{display:'flex',alignItems:'center',fontSize:'15px',color:'#333',cursor:'pointer'}}><input type="checkbox" name="estado" checked={formData.estado} onChange={handleChange} style={{width:'20px',height:'20px',cursor:'pointer'}} /><span style={{marginLeft:'8px'}}>Activo</span></label></div>
          <div style={{display:'flex',gap:'12px',marginTop:'30px'}}>
            <button type="submit" disabled={loading} style={{padding:'12px 24px',border:'none',borderRadius:'8px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',color:'#fff',flex:1,opacity:loading?0.6:1}}>{loading?<><i className="fa fa-spinner fa-spin" style={{marginRight:'8px'}}></i>Guardando...</>:<><i className="fa fa-save" style={{marginRight:'8px'}}></i>Guardar Cliente</>}</button>
            <button type="button" onClick={()=>router.push('/maestras/clientes')} style={{padding:'12px 24px',border:'none',borderRadius:'8px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',background:'#ef5350',color:'#fff'}} disabled={loading}><i className="fa fa-times" style={{marginRight:'8px'}}></i>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
