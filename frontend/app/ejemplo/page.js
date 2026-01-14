'use client';

import { useState } from 'react';
import { useConfirm } from '../components/ConfirmDialog';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import { TableSkeleton } from '../components/SkeletonLoaders';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

// Datos de ejemplo
const MOCK_USERS = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  nombre: `Usuario ${i + 1}`,
  email: `usuario${i + 1}@example.com`,
  rol: ['Admin', 'Supervisor', 'Operador'][i % 3],
  estado: i % 5 === 0 ? 'Inactivo' : 'Activo',
}));

/**
 * Página de ejemplo mostrando integración de:
 * - Pagination + usePagination
 * - ConfirmDialog + useConfirm
 * - TableSkeleton
 * - Toast notifications
 */
export default function EjemploPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { confirm } = useConfirm();

  // Filtrar usuarios por búsqueda
  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const {
    currentPage,
    currentData,
    totalPages,
    goToPage,
  } = usePagination(filteredUsers, 10);

  // Simular carga
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Datos actualizados');
    }, 1500);
  };

  // Eliminar con confirmación
  const handleDelete = async (user) => {
    const confirmed = await confirm({
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de eliminar a "${user.nombre}"? Esta acción no se puede deshacer.`,
      variant: 'danger',
      confirmText: 'Eliminar',
    });

    if (confirmed) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast.success(`Usuario ${user.nombre} eliminado`);
    }
  };

  // Editar
  const handleEdit = (user) => {
    toast('Función de edición (por implementar)', { icon: '✏️' });
  };

  // Crear
  const handleCreate = () => {
    toast('Función de crear usuario (por implementar)', { icon: '➕' });
  };

  if (loading) {
    return (
      <div className="ejemplo-page">
        <h1>Ejemplo de Integraciones</h1>
        <TableSkeleton rows={10} columns={5} />
      </div>
    );
  }

  return (
    <div className="ejemplo-page">
      <div className="page-header">
        <div>
          <h1>Ejemplo de Integraciones</h1>
          <p className="page-subtitle">
            Demostración de Pagination, ConfirmDialog, Skeleton y Toast
          </p>
        </div>
        <div className="page-actions">
          <button className="btn-secondary" onClick={handleRefresh}>
            Actualizar
          </button>
          <button className="btn-primary" onClick={handleCreate}>
            <Plus size={18} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nombre}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.rol.toLowerCase()}`}>
                    {user.rol}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${user.estado === 'Activo' ? 'success' : 'inactive'}`}>
                    {user.estado}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-icon-edit"
                      onClick={() => handleEdit(user)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-icon btn-icon-delete"
                      onClick={() => handleDelete(user)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        itemsPerPage={10}
        totalItems={filteredUsers.length}
      />
    </div>
  );
}
