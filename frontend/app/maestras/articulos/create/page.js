'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CreateArticuloPage() {
  const [formData, setFormData] = useState({
    descripcion: '',
    unidad_medida_general: '',
    unidad_medida_especial: '',
    unidad_medida_intermedia: '',
    categoria: '',
    estado: '',
  });
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  const styles = {
    container: { padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '24px', fontWeight: '700', color: '#1565c0', display: 'flex', alignItems: 'center' },
    backButton: { background: 'transparent', border: 'none', color: '#666', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    formCard: { background: '#fff', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', padding: '30px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444', fontSize: '14px' },
    input: { width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', color: '#333', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fafafa' },
    checkboxContainer: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' },
    checkboxLabel: { fontSize: '14px', color: '#333', cursor: 'pointer' },
    submitButton: { width: '100%', padding: '14px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)', transition: 'transform 0.1s' },
    errorAlert: { padding: '15px', borderRadius: '8px', backgroundColor: '#ffebee', color: '#c62828', marginBottom: '20px', display: 'flex', alignItems: 'center', fontSize: '14px' },
    required: { color: '#d32f2f', marginLeft: '3px' }
  };

  useEffect(() => {
    if (token) {
        Promise.all([
            axios.get('/api/core/categorias/?estado=true&eliminado=false', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('/api/core/unidades-medida/?estado=true&eliminado=false', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('/api/maestras/master-estados/?estado=true', { headers: { Authorization: `Bearer ${token}` } })
        ]).then(([catRes, uniRes, estRes]) => {
            setCategorias(catRes.data);
            setUnidades(uniRes.data);
            setEstados(estRes.data);
        }).catch(err => console.error("Error loading data", err));
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.descripcion.trim() || !formData.unidad_medida_general || !formData.estado) {
      setError('Descripción, Unidad General y Estado son requeridos');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Clean empty strings for optional fields to send null
      const dataToSend = {
          ...formData,
          unidad_medida_especial: formData.unidad_medida_especial || null,
          unidad_medida_intermedia: formData.unidad_medida_intermedia || null,
          categoria: formData.categoria || null
      };

      await axios.post('/api/core/articulos/', dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/maestras/articulos');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el artículo');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <i className="fa fa-box" style={{ marginRight: '10px' }}></i>
          Crear Artículo
        </h1>
        <button onClick={() => router.push('/maestras/articulos')} style={styles.backButton}>
          <i className="fa fa-arrow-left" style={{ marginRight: '8px' }}></i>
          Volver
        </button>
      </div>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={styles.errorAlert}>
              <i className="fa fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
              {error}
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Código <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="codigo"
              value={formData.codigo || ''}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Descripción <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Categoría</label>
            <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                style={styles.input}
            >
                <option value="">Seleccione una categoría...</option>
                {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.descripcion}</option>
                ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Unidad Medida General <span style={styles.required}>*</span>
            </label>
            <select
              name="unidad_medida_general"
              value={formData.unidad_medida_general}
              onChange={handleChange}
              style={styles.input}
              required
            >
                <option value="">Seleccione...</option>
                {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.descripcion}</option>
                ))}
            </select>
          </div>

          <div style={{display:'flex', gap:'20px'}}>
             <div style={{...styles.formGroup, flex:1}}>
                <label style={styles.label}>Unidad Medida Especial</label>
                <select
                  name="unidad_medida_especial"
                  value={formData.unidad_medida_especial}
                  onChange={handleChange}
                  style={styles.input}
                >
                    <option value="">Seleccione...</option>
                    {unidades.map(u => (
                        <option key={u.id} value={u.id}>{u.descripcion}</option>
                    ))}
                </select>
            </div>
            <div style={{...styles.formGroup, flex:1}}>
                <label style={styles.label}>Unidad Medida Intermedia</label>
                <select
                  name="unidad_medida_intermedia"
                  value={formData.unidad_medida_intermedia}
                  onChange={handleChange}
                  style={styles.input}
                >
                    <option value="">Seleccione...</option>
                    {unidades.map(u => (
                        <option key={u.id} value={u.id}>{u.descripcion}</option>
                    ))}
                </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Estado <span style={styles.required}>*</span>
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              style={styles.input}
              required
            >
                <option value="">Seleccione un estado...</option>
                {estados.map(e => (
                    <option key={e.id} value={e.id}>{e.descripcion}</option>
                ))}
            </select>
          </div>

          <button type="submit" disabled={saving} style={{...styles.submitButton, opacity: saving ? 0.7 : 1}}>
            {saving ? (
              <span><i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>Guardando...</span>
            ) : (
              <span><i className="fa fa-save" style={{ marginRight: '8px' }}></i>Guardar Artículo</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
