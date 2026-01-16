'use client';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

const CATEGORIAS_LICENCIA = [
  // Colombia
  { value: 'A1', label: 'A1 - Motocicletas hasta 125cc (Colombia)' },
  { value: 'A2', label: 'A2 - Motocicletas mayores a 125cc (Colombia)' },
  { value: 'B1', label: 'B1 - Automóviles, motocarros, cuatrimotor y camperos (Colombia)' },
  { value: 'B2', label: 'B2 - Camionetas y microbuses (Colombia)' },
  { value: 'B3', label: 'B3 - Vehículos de servicio público (Colombia)' },
  { value: 'C1', label: 'C1 - Camiones rígidos, busetas y buses (Colombia)' },
  { value: 'C2', label: 'C2 - Vehículos articulados (Colombia)' },
  { value: 'C3', label: 'C3 - Vehículos de servicio público de carga (Colombia)' },
  // Estados Unidos
  { value: 'CLASS_A', label: 'Class A - Combination vehicles (USA)' },
  { value: 'CLASS_B', label: 'Class B - Heavy straight vehicles (USA)' },
  { value: 'CLASS_C', label: 'Class C - Small vehicles (USA)' },
  { value: 'CLASS_D', label: 'Class D - Regular operator license (USA)' },
  { value: 'CLASS_M', label: 'Class M - Motorcycles (USA)' },
  { value: 'CDL', label: 'CDL - Commercial Driver License (USA)' },
];

export default function CreateConductorPage() {
  const [formData, setFormData] = useState({ 
    cedula: '', 
    nombre: '', 
    celular: '', 
    licencia: [], 
    estado: '' 
  });
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
      if (token) {
          axios.get('/api/maestras/master-estados/?estado=true', { headers: { Authorization: `Bearer ${token}` } })
              .then(res => setEstados(res.data))
              .catch(err => console.error("Error cargando estados", err));
      }
  }, [token]);

  const handleChange = (e) => { 
    const { name, value, type, checked } = e.target; 
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); 
  };

  const handleLicenciaChange = (categoria) => {
    setFormData(prev => {
      const licencias = prev.licencia.includes(categoria)
        ? prev.licencia.filter(l => l !== categoria)
        : [...prev.licencia, categoria];
      return { ...prev, licencia: licencias };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cedula.trim() || !formData.nombre.trim() || !formData.celular.trim() || !formData.estado) { 
      setError('Cédula, nombre, celular y estado son requeridos'); 
      return; 
    }
    if (formData.licencia.length === 0) {
      setError('Debe seleccionar al menos una categoría de licencia');
      return;
    }
    setLoading(true); 
    setError(null);
    try {
      await axios.post('/api/core/conductores/', formData, { headers: { Authorization: `Bearer ${token}` } });
      router.push('/maestras/conductores');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el conductor');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) { router.push('/'); return null; }

  return (
    <div style={{padding:'30px',maxWidth:'800px',margin:'0 auto',fontFamily:'Inter, sans-serif'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'30px'}}>
        <h1 style={{fontSize:'28px',fontWeight:'700',color:'#1565c0',margin:0,display:'flex',alignItems:'center'}}>
          <i className="fa fa-plus-circle" style={{marginRight:'10px'}}></i>Crear Nuevo Conductor
        </h1>
        <button onClick={()=>router.push('/maestras/conductores')} style={{padding:'10px 20px',background:'#f5f5f5',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',fontWeight:'600',color:'#666'}}>
          <i className="fa fa-arrow-left" style={{marginRight:'8px'}}></i>Volver
        </button>
      </div>
      <div style={{background:'#fff',borderRadius:'12px',padding:'40px',boxShadow:'0 4px 12px rgba(0,0,0,0.08)'}}>
        <form onSubmit={handleSubmit}>
          {error&&<div style={{background:'#ffebee',color:'#c62828',padding:'12px 16px',borderRadius:'8px',marginBottom:'20px',display:'flex',alignItems:'center'}}>
            <i className="fa fa-exclamation-circle" style={{marginRight:'8px'}}></i>{error}
          </div>}
          
          <div style={{marginBottom:'25px'}}>
            <label style={{display:'block',marginBottom:'8px',fontSize:'14px',fontWeight:'600',color:'#333'}}>
              Cédula <span style={{color:'#d32f2f'}}>*</span>
            </label>
            <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="Ej: 1234567890" style={{width:'100%',padding:'12px 16px',border:'2px solid #e0e0e0',borderRadius:'8px',fontSize:'15px',outline:'none',boxSizing:'border-box'}} required />
          </div>
          
          <div style={{marginBottom:'25px'}}>
            <label style={{display:'block',marginBottom:'8px',fontSize:'14px',fontWeight:'600',color:'#333'}}>
              Nombre <span style={{color:'#d32f2f'}}>*</span>
            </label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre completo" style={{width:'100%',padding:'12px 16px',border:'2px solid #e0e0e0',borderRadius:'8px',fontSize:'15px',outline:'none',boxSizing:'border-box'}} required />
          </div>
          
          <div style={{marginBottom:'25px'}}>
            <label style={{display:'block',marginBottom:'8px',fontSize:'14px',fontWeight:'600',color:'#333'}}>
              Celular <span style={{color:'#d32f2f'}}>*</span>
            </label>
            <input type="text" name="celular" value={formData.celular} onChange={handleChange} placeholder="Ej: 3001234567" style={{width:'100%',padding:'12px 16px',border:'2px solid #e0e0e0',borderRadius:'8px',fontSize:'15px',outline:'none',boxSizing:'border-box'}} required />
          </div>
          
          <div style={{marginBottom:'25px'}}>
            <label style={{display:'block',marginBottom:'12px',fontSize:'14px',fontWeight:'600',color:'#333'}}>
              Categorías de Licencia <span style={{color:'#d32f2f'}}>*</span>
            </label>
            <div style={{border:'2px solid #e0e0e0',borderRadius:'8px',padding:'16px',maxHeight:'300px',overflowY:'auto'}}>
              {CATEGORIAS_LICENCIA.map(cat => (
                <label key={cat.value} style={{display:'flex',alignItems:'center',padding:'8px',cursor:'pointer',borderRadius:'6px',transition:'background 0.2s',':hover':{background:'#f5f5f5'}}}>
                  <input
                    type="checkbox"
                    checked={formData.licencia.includes(cat.value)}
                    onChange={() => handleLicenciaChange(cat.value)}
                    style={{width:'18px',height:'18px',cursor:'pointer',marginRight:'12px'}}
                  />
                  <span style={{fontSize:'14px',color:'#333'}}>{cat.label}</span>
                </label>
              ))}
            </div>
            <p style={{fontSize:'12px',color:'#666',marginTop:'8px'}}>
              Seleccionadas: {formData.licencia.length > 0 ? formData.licencia.join(', ') : 'Ninguna'}
            </p>
          </div>
          
          <div style={{marginBottom:'25px'}}>
            <label style={{display:'block',marginBottom:'8px',fontSize:'14px',fontWeight:'600',color:'#333'}}>
              Estado <span style={{color:'#d32f2f'}}>*</span>
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              style={{width:'100%',padding:'12px 16px',border:'2px solid #e0e0e0',borderRadius:'8px',fontSize:'15px',outline:'none',boxSizing:'border-box'}}
              required
            >
                <option value="">Seleccione un estado...</option>
                {estados.map(e => (
                    <option key={e.id} value={e.id}>{e.descripcion}</option>
                ))}
            </select>
          </div>
          
          <div style={{display:'flex',gap:'12px',marginTop:'30px'}}>
            <button type="submit" disabled={loading} style={{padding:'12px 24px',border:'none',borderRadius:'8px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',color:'#fff',flex:1,opacity:loading?0.6:1}}>
              {loading?<><i className="fa fa-spinner fa-spin" style={{marginRight:'8px'}}></i>Guardando...</>:<><i className="fa fa-save" style={{marginRight:'8px'}}></i>Guardar Conductor</>}
            </button>
            <button type="button" onClick={()=>router.push('/maestras/conductores')} style={{padding:'12px 24px',border:'none',borderRadius:'8px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',background:'#ef5350',color:'#fff'}} disabled={loading}>
              <i className="fa fa-times" style={{marginRight:'8px'}}></i>Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
