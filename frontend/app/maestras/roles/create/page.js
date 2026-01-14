'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CreateRolePage() {
  const [formData, setFormData] = useState({
    descripcion_rol: '',
    estado: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.descripcion_rol.trim()) {
      setError('La descripción es requerida');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post('/api/maestras/roles/', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/maestras/roles');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el rol');
      console.error('Error creating role:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    router.push('/');
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <i className="fa fa-plus-circle" style={{ marginRight: '10px' }}></i>
          Crear Nuevo Rol
        </h1>
        <button
          onClick={() => router.push('/maestras/roles')}
          style={styles.backButton}
        >
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
              Descripción del Rol <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="descripcion_rol"
              value={formData.descripcion_rol}
              onChange={handleChange}
              placeholder="Ej: Administrador, Operador, etc."
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="estado"
                checked={formData.estado}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span style={{ marginLeft: '8px' }}>Activo</span>
            </label>
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...styles.submitButton,
                ...(loading && styles.buttonDisabled),
              }}
            >
              {loading ? (
                <>
                  <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fa fa-save" style={{ marginRight: '8px' }}></i>
                  Guardar Rol
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/maestras/roles')}
              style={{ ...styles.button, ...styles.cancelButton }}
              disabled={loading}
            >
              <i className="fa fa-times" style={{ marginRight: '8px' }}></i>
              Cancelar
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
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
  },
  submitButton: {
    background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
    color: '#fff',
    flex: 1,
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
