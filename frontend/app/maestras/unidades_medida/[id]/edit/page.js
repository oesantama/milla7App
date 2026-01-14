'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';

export default function EditUnidadMedidaPage() {
  const [formData, setFormData] = useState({
    descripcion: '',
    estado: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id;

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
    required: { color: '#d32f2f', marginLeft: '3px' },
    loading: { textAlign: 'center', padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', color: '#666' }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) { router.push('/'); return; }
    const fetchUnidad = async () => {
      try {
        const response = await axios.get(`/api/core/unidades-medida/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
        setFormData({
            descripcion: response.data.descripcion,
            abreviatura: response.data.abreviatura,
            estado: response.data.estado,
        });
      } catch (err) {
        setError('Error al cargar la unidad');
        console.error("Error fetching unit", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUnidad();
  }, [isAuthenticated, token, id, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.descripcion.trim()) {
      setError('La descripción es requerida');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await axios.put(`/api/core/unidades-medida/${id}/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/maestras/unidades_medida');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la unidad');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div style={styles.loading}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '32px', color: '#1565c0' }}></i>
        <p>Cargando unidad...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <i className="fa fa-edit" style={{ marginRight: '10px' }}></i>
          Editar Unidad de Medida
        </h1>
        <button onClick={() => router.push('/maestras/unidades_medida')} style={styles.backButton}>
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
            <label style={styles.label}>Abreviatura</label>
            <input
              type="text"
              name="abreviatura"
              value={formData.abreviatura || ''}
              onChange={handleChange}
              style={styles.input}
              placeholder="Ej: Kg, m, und"
            />
          </div>

          <div style={styles.formGroup}>
            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                name="estado"
                id="estado"
                checked={formData.estado}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="estado" style={styles.checkboxLabel}>
                Activo
              </label>
            </div>
          </div>

          <button type="submit" disabled={saving} style={{...styles.submitButton, opacity: saving ? 0.7 : 1}}>
            {saving ? (
              <span><i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>Guardando...</span>
            ) : (
              <span><i className="fa fa-save" style={{ marginRight: '8px' }}></i>Guardar Cambios</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
