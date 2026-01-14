'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { exportToExcel } from '../../../utils/exportToExcel';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, usuario: null });
  const { token, isAuthenticated, user, permissions } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !token) { router.push('/'); return; }
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get('/api/users/usuarios/', { headers: { Authorization: `Bearer ${token}` } });
        setUsuarios(response.data);
      } catch (err) {
        console.error('Error fetching usuarios:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, [isAuthenticated, token, router]);

  const handleDelete = async () => {
    const id = deleteModal.usuario.id;
    setDeleteModal({ show: false, usuario: null });
    try {
      await axios.delete(`/api/users/usuarios/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      
      // Check if current user is Role 1 or Superuser
      const isRole1 = user?.role_id === 1 || user?.is_superuser;

      if (isRole1) {
        // Update local state to show as Eliminado instead of removing
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, is_active: false, eliminado: true } : u));
      } else {
        // Remove from list for other roles
        setUsuarios(usuarios.filter(u => u.id !== id));
      }
    } catch (err) {
      alert('Error al eliminar el usuario');
    }
  };

  const filteredUsuarios = usuarios.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prioritize exact matches to avoid picking up 'Reporte Usuarios' or similar read-only tabs
  const userPermissions = permissions.find(p => p.nombre.toLowerCase().includes('usuario')) || {};
  
  const canCreate = userPermissions.crear;
  const canEdit = userPermissions.editar;
  const canDelete = userPermissions.borrar;

  if (loading) return <div style={{textAlign:'center',padding:'50px'}}>Cargando usuarios...</div>;

  return (
    <div style={{padding:'30px',maxWidth:'1600px',margin:'0 auto',fontFamily:'Inter, sans-serif'}}>
      <h1 style={{fontSize:'28px',fontWeight:'700',color:'#1565c0',marginBottom:'25px',display:'flex',alignItems:'center'}}>
        <i className="fa fa-users" style={{marginRight:'10px'}}></i>Gestión de Usuarios
      </h1>

      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'25px',gap:'15px',flexWrap:'wrap'}}>
        <input type="text" placeholder="🔍 Buscar usuario..." style={{padding:'12px 18px',border:'2px solid #e0e0e0',borderRadius:'10px',fontSize:'15px',width:'300px',outline:'none'}} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <div style={{display:'flex',gap:'12px'}}>
          {canCreate && <button onClick={() => router.push('/maestras/usuarios/create')} style={{padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',background:'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',color:'#fff'}}><i className="fa fa-plus" style={{marginRight:'8px'}}></i>Crear Usuario</button>}
          <button onClick={() => exportToExcel(filteredUsuarios.map(u => ({Usuario: u.username, Email: u.email, Rol: u.role_name || 'Sin rol', Activo: u.is_active ? 'Sí' : 'No'})), 'usuarios_milla7')} style={{padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',background:'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',color:'#fff'}}><i className="fa fa-file-excel" style={{marginRight:'8px'}}></i>Exportar</button>
        </div>
      </div>

      <div style={{background:'#fff',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.08)',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px'}}>Usuario</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px'}}>Email</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px'}}>Rol</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px'}}>Permisos</th>
              <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px'}}>Estado</th>
              {(canEdit || canDelete) && <th style={{background:'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',color:'#fff',padding:'16px',textAlign:'left',fontWeight:'600',fontSize:'14px'}}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.map(u => (
              <tr key={u.id} style={{borderBottom:'1px solid #f0f0f0'}}>
                <td style={{padding:'16px',fontSize:'14px'}}>{u.username}</td>
                <td style={{padding:'16px',fontSize:'14px'}}>{u.email}</td>
                <td style={{padding:'16px',fontSize:'14px'}}>{u.role_name || 'Sin rol'}</td>
                <td style={{padding:'16px',fontSize:'12px'}}>{u.permisos?.length || 0} permisos</td>
                <td style={{padding:'16px'}}>
                  {u.eliminado ? (
                    <span style={{padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',background:'#ffcdd2',color:'#b71c1c'}}>Eliminado</span>
                  ) : u.is_active ? (
                    <span style={{padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',background:'#e8f5e9',color:'#2e7d32'}}>Activo</span>
                  ) : (
                    <span style={{padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',background:'#fff9c4',color:'#fbc02d'}}>Inactivo</span>
                  )}
                </td>
                {(canEdit || canDelete) && (
                  <td style={{padding:'16px'}}>
                    {!u.eliminado && (
                      <div style={{display:'flex',gap:'8px'}}>
                        {canEdit && <button onClick={() => router.push(`/maestras/usuarios/${u.id}/edit`)} style={{padding:'8px 12px',border:'none',borderRadius:'8px',cursor:'pointer',background:'#FFA726',color:'#fff'}}><i className="fa fa-pencil-alt"></i></button>}
                        {canDelete && <button onClick={() => setDeleteModal({show:true,usuario:u})} style={{padding:'8px 12px',border:'none',borderRadius:'8px',cursor:'pointer',background:'#EF5350',color:'#fff'}}><i className="fa fa-trash-alt"></i></button>}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteModal.show && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div style={{background:'#fff',borderRadius:'16px',padding:'32px',maxWidth:'450px',width:'90%',boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <div style={{width:'64px',height:'64px',margin:'0 auto 16px',background:'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}><i className="fa fa-exclamation-triangle" style={{fontSize:'32px',color:'#fff'}}></i></div>
              <h2 style={{fontSize:'24px',fontWeight:'700',color:'#333',margin:'0 0 8px 0'}}>¿Eliminar Usuario?</h2>
              <p style={{fontSize:'15px',color:'#666',margin:0}}>¿Está seguro de eliminar el usuario <strong>{deleteModal.usuario?.username}</strong>?</p>
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={()=>setDeleteModal({show:false,usuario:null})} style={{flex:1,padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',background:'#ef5350',color:'#fff'}}><i className="fa fa-times" style={{marginRight:'8px'}}></i>Cancelar</button>
              <button onClick={handleDelete} style={{flex:1,padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',background:'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',color:'#fff'}}><i className="fa fa-check" style={{marginRight:'8px'}}></i>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
