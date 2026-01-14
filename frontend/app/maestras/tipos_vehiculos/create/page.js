'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CreateTipoVehiculoPage() {
  const [formData, setFormData] = useState({ descripcion: '', estado: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.descripcion.trim()) { setError('La descripción es obligatoria'); return; }
    
    setLoading(true);
    try {
      await axios.post('/api/core/tipos-vehiculos/', formData, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('access_token')}` }
      });
      router.push('/maestras/tipos_vehiculos');
    } catch (err) {
      setError(err.response?.data?.descripcion?.[0] || 'Error al crear el tipo de vehículo');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated && !token) {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
           <i className="fa fa-plus-circle" style={{ marginRight: '10px' }}></i>
           Crear Tipo de Vehículo
        </h1>
        <button onClick={() => router.back()} style={styles.backButton}>
           <i className="fa fa-arrow-left" style={{ marginRight: '8px' }}></i>
           Volver
        </button>
      </div>

       <div style={styles.formCard}>
         {error && (
            <div style={styles.errorAlert}>
              <i className="fa fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
              {error}
            </div>
         )}
         <form onSubmit={handleSubmit}>
           <div style={styles.formGroup}>
             <label style={styles.label}>Descripción <span style={styles.required}>*</span></label>
             <input 
               type="text" 
               value={formData.descripcion} 
               onChange={(e)=>setFormData({...formData, descripcion: e.target.value})} 
               style={styles.input} 
               placeholder="Ej: Camión, Tractomula..." 
             />
           </div>
           
           <div style={styles.formGroup}>
             <label style={styles.checkboxLabel}>
               <input 
                 type="checkbox" 
                 checked={formData.estado} 
                 onChange={(e)=>setFormData({...formData, estado: e.target.checked})} 
                 style={styles.checkbox} 
               />
               <span style={{marginLeft: '10px'}}>Activo</span>
             </label>
           </div>
           
           <div style={styles.buttonGroup}>
             <button type="button" onClick={()=>router.back()} style={{...styles.button, ...styles.cancelButton}}>Cancelar</button>
             <button type="submit" disabled={loading} style={{...styles.button, ...styles.submitButton, ...(loading ? styles.buttonDisabled : {})}}>
               {loading ? 'Guardando...' : 'Guardar Tipo'}
             </button>
           </div>
         </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Inter, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1565c0',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },
  backButton: {
    padding: '10px 20px',
    background: '#f5f5f5',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    transition: 'all 0.3s ease',
  },
  formCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    maxWidth: '800px',
    margin: '0 auto',
  },
  formGroup: {
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  required: {
    color: '#d32f2f',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    color: '#333',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '30px',
  },
  button: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  submitButton: {
    background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
    color: '#fff',
  },
  cancelButton: {
    background: '#ef5350',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  errorAlert: {
    background: '#ffebee',
    color: '#c62828',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
  },
};
