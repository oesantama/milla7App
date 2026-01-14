'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';

export default function EditVehiculoPage() {
  const [formData, setFormData] = useState({
    placa: '',
    propietario: '',
    cubicaje: '',
    modelo: '',
    tipo_vehiculo: '',
    estado: '',
  });
  const [tiposVehiculos, setTiposVehiculos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const placa = params.id;

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/');
      return;
    }

    // Fetch types and states
    axios.get('/api/core/tipos-vehiculos/?estado=true', { headers: { Authorization: `Bearer ${token}` } })
         .then(res => setTiposVehiculos(res.data))
         .catch(err => console.error("Error cargando tipos", err));
    
    axios.get('/api/maestras/master-estados/?estado=true', { headers: { Authorization: `Bearer ${token}` } })
         .then(res => setEstados(res.data))
         .catch(err => console.error("Error cargando estados", err));

    const fetchVehiculo = async () => {
      try {
        const response = await axios.get(`/api/core/vehiculos/${placa}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({
          placa: response.data.placa,
          propietario: response.data.propietario,
          cubicaje: response.data.cubicaje,
          modelo: response.data.modelo,
          tipo_vehiculo: response.data.tipo_vehiculo || '',
          estado: response.data.estado || '',
        });
      } catch (err) {
        setError('Error al cargar el vehículo');
        console.error('Error fetching vehiculo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehiculo();
  }, [isAuthenticated, token, placa, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.propietario.trim() || !formData.modelo.trim() || !formData.tipo_vehiculo || !formData.estado) {
      setError('Propietario, modelo, tipo y estado son requeridos');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await axios.put(`/api/core/vehiculos/${placa}/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/maestras/vehiculos');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el vehículo');
      console.error('Error updating vehiculo:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '32px', color: '#1565c0' }}></i>
        <p>Cargando vehículo...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <i className="fa fa-edit" style={{ marginRight: '10px' }}></i>
          Editar Vehículo
        </h1>
        <button
          onClick={() => router.push('/maestras/vehiculos')}
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
            <label style={styles.label}>Placa</label>
            <input
              type="text"
              value={formData.placa}
              style={{ ...styles.input, backgroundColor: '#f5f5f5' }}
              disabled
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Propietario <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="propietario"
              value={formData.propietario}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Tipo de Vehículo <span style={styles.required}>*</span>
            </label>
            <select
              name="tipo_vehiculo"
              value={formData.tipo_vehiculo}
              onChange={handleChange}
              style={styles.input}
              required
            >
                <option value="">Seleccione un tipo...</option>
                {tiposVehiculos.map(t => (
                    <option key={t.id} value={t.id}>{t.descripcion}</option>
                ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Cubicaje</label>
            <input
              type="number"
              step="0.01"
              name="cubicaje"
              value={formData.cubicaje}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Modelo <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              style={styles.input}
              required
            />
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

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.button,
                ...styles.submitButton,
                background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                ...(saving && styles.buttonDisabled),
              }}
            >
              {saving ? (
                <>
                  <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fa fa-save" style={{ marginRight: '8px' }}></i>
                  Guardar Cambios
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/maestras/vehiculos')}
              style={{ ...styles.button, ...styles.cancelButton, background: '#ef5350', color: '#fff' }}
              disabled={saving}
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
    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
    color: '#fff',
    flex: 1,
  },
  cancelButton: {
    background: '#f5f5f5',
    color: '#666',
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
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    gap: '15px',
  },
};
