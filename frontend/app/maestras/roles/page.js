'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { exportToExcel } from '../../../utils/exportToExcel';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('id_rol');
  const [sortDirection, setSortDirection] = useState('asc');
  const { token, isAuthenticated, fullAccess, permissions } = useAuth();
  const router = useRouter();

  // Check permissions
  const pagePermissions = permissions.find(p => p.nombre.toLowerCase().includes('rol')) || {};
  const canCreate = pagePermissions.crear;
  const canEdit = pagePermissions.editar;
  const canDelete = pagePermissions.borrar;

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/');
      return;
    }

    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/maestras/roles/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRoles(response.data);
      } catch (err) {
        setError('Error al cargar roles.');
        console.error('Error fetching roles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [isAuthenticated, token, router]);

  // Format date to Colombian timezone
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  // Sorting function
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getBadgeColor = (estado) => {
      const e = estado?.toLowerCase() || '';
      if(e.includes('disponible') || e.includes('activo')) return { bg: '#e8f5e9', text: '#2e7d32' };
      if(e.includes('mantenimiento') || e.includes('licencia') || e.includes('inactivo')) return { bg: '#fff3e0', text: '#ef6c00' };
      return { bg: '#ffebee', text: '#c62828' };
  };

  // Filter and sort roles
  const filteredAndSortedRoles = roles
    .filter(role =>
      role.descripcion_rol?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      // Handle different data types
      if (sortColumn === 'estado_descripcion') {
        aVal = a.estado_descripcion?.toLowerCase() || '';
        bVal = b.estado_descripcion?.toLowerCase() || '';
      } else if (sortColumn === 'fecha_creacion') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleExport = () => {
    const dataToExport = filteredAndSortedRoles.map(role => ({
      ID: role.id_rol,
      Descripción: role.descripcion_rol,
      Estado: role.estado_descripcion || 'Sin Asignar',
      'Fecha de Creación': formatDate(role.fecha_creacion),
      'Última Modificación': formatDate(role.fecha_modificacion),
    }));
    exportToExcel(dataToExport, 'roles_milla7');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este rol?')) return;
    
    try {
      await axios.delete(`/api/maestras/roles/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(roles.filter(r => r.id_rol !== id));
    } catch (err) {
      alert('Error al eliminar el rol');
      console.error(err);
    }
  };

  if (loading) return <div style={styles.loading}>Cargando roles...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        <i className="fa fa-users-cog" style={{ marginRight: '10px' }}></i>
        Gestión de Roles
      </h1>

      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="🔍 Buscar rol..."
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={styles.buttonGroup}>
          {canCreate && (
            <button
              onClick={() => router.push('/maestras/roles/create')}
              style={{ ...styles.button, ...styles.createButton }}
            >
              <i className="fa fa-plus" style={{ marginRight: '8px' }}></i>
              Crear Rol
            </button>
          )}
          <button
            onClick={handleExport}
            style={{ ...styles.button, ...styles.exportButton }}
          >
            <i className="fa fa-file-excel" style={{ marginRight: '8px' }}></i>
            Exportar a Excel
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th} onClick={() => handleSort('id_rol')}>
                ID {sortColumn === 'id_rol' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th style={styles.th} onClick={() => handleSort('descripcion_rol')}>
                Descripción {sortColumn === 'descripcion_rol' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th style={styles.th} onClick={() => handleSort('estado_descripcion')}>
                Estado {sortColumn === 'estado_descripcion' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th style={styles.th} onClick={() => handleSort('fecha_creacion')}>
                Fecha de Creación {sortColumn === 'fecha_creacion' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th style={styles.th} onClick={() => handleSort('fecha_modificacion')}>
                Última Modificación {sortColumn === 'fecha_modificacion' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              {(canEdit || canDelete) && <th style={styles.th}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRoles.map((role) => {
              const badge = getBadgeColor(role.estado_descripcion);
              return (
                <tr key={role.id_rol} style={styles.tr}>
                  <td style={styles.td}>{role.id_rol}</td>
                  <td style={styles.td}>{role.descripcion_rol}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: badge.bg,
                      color: badge.text
                    }}>
                      {role.estado_descripcion || 'Sin Asignar'}
                    </span>
                  </td>
                  <td style={styles.td}>{formatDate(role.fecha_creacion)}</td>
                  <td style={styles.td}>{formatDate(role.fecha_modificacion)}</td>
                  {(canEdit || canDelete) && (
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        {canEdit && (
                          <button
                            onClick={() => router.push(`/maestras/roles/${role.id_rol}/edit`)}
                            style={{ ...styles.actionButton, ...styles.editButton }}
                            title="Editar rol"
                          >
                            <i className="fa fa-pencil-alt"></i>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(role.id_rol)}
                            style={{ ...styles.actionButton, ...styles.deleteButton }}
                            title="Eliminar rol"
                          >
                            <i className="fa fa-trash-alt"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSortedRoles.length === 0 && (
        <div style={styles.noData}>
          <i className="fa fa-inbox" style={{ fontSize: '48px', color: '#ccc', marginBottom: '10px' }}></i>
          <p>No se encontraron roles</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1565c0',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'center',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    gap: '15px',
    flexWrap: 'wrap',
  },
  searchInput: {
    padding: '12px 18px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '15px',
    width: '300px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  button: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  createButton: {
    background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
    color: '#fff',
  },
  exportButton: {
    background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
    color: '#fff',
  },
  tableContainer: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
    color: '#fff',
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background 0.3s ease',
  },
  tr: {
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.2s ease',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#333',
  },
  badge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'inline-block',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    color: '#fff',
  },
  editButton: {
    background: '#FFA726',
  },
  deleteButton: {
    background: '#EF5350',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#d32f2f',
  },
  noData: {
    textAlign: 'center',
    padding: '60px',
    color: '#999',
  },
};
