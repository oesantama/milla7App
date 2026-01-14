'use client';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GridSkeleton } from '../components/SkeletonLoaders';
import { useClientes } from '../hooks/useQueries';

export default function Desktop() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: clientes = [], isLoading, error } = useClientes();
  
  // Read More Logic (P16)
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  
  const toggleDescription = (id, e) => {
    e.stopPropagation();
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="dashboard-main" style={{ padding: '32px 0 0 0', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ color: '#0056b3', marginBottom: '20px', fontWeight: 700, fontSize: '1.5em', textAlign: 'center' }}>
          Mis Operaciones Asignadas
        </h2>
        <GridSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return <div style={{textAlign:'center', marginTop:'50px', color:'red'}}>Error al cargar operaciones</div>;
  }

  return (
    <div
      className="dashboard-main"
      style={{ padding: '32px 0 0 0', maxWidth: '1000px', margin: '0 auto' }}
    >
      <div style={{ marginBottom: '40px' }}>
        {/* P4: Counter in Title */}
        <h2
          style={{
            color: '#0056b3',
            marginBottom: '20px',
            fontWeight: 700,
            fontSize: '1.5em',
            textAlign: 'center'
          }}
        >
          Mis Operaciones Asignadas ({clientes.length})
        </h2>
        
        {clientes.length === 0 ? (
          <div style={{textAlign:'center', color:'#666', padding:'40px', background:'#fff', borderRadius:'12px'}}>
            <i className="fa fa-info-circle" style={{fontSize:'48px', color:'#ccc', marginBottom:'20px'}}></i>
            <p>No tienes clientes u operaciones asignadas. Contacta al administrador.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '25px',
              justifyContent: 'center',
            }}
          >
            {clientes.map((cliente) => {
              const isExpanded = expandedDescriptions.has(cliente.id);
              const description = cliente.descripcion || 'Sin descripción disponible.';
              const shouldTruncate = description.length > 80;

              return (
              <div
                key={cliente.id}
                className="dashboard-card"
                style={{
                  background: '#fff',
                  color: '#34495e',
                  width: '240px',
                  padding: '25px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  fontWeight: 600,
                  fontSize: '1.08em',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: '1px solid #f0f0f0'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                }}
                onClick={() => {
                  // Navegar a la página de detalle de la operación/cliente
                  router.push(`/operaciones/${cliente.id}`);
                }}
              >
                {/* Badge Status (P3) */}
                <div style={{
                    position:'absolute', 
                    top:'10px', 
                    right:'10px', 
                    width:'12px', 
                    height:'12px', 
                    borderRadius:'50%', 
                    background: cliente.activo !== false ? '#4caf50' : '#f44336',
                    border: '2px solid #fff' 
                }} title={cliente.activo !== false ? 'Activo' : 'Inactivo'}></div>

                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  marginBottom: '15px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: '#f8f9fa',
                  overflow: 'hidden'
                }}>
                  {cliente.logo ? (
                    <img 
                      src={cliente.logo} 
                      alt={cliente.nombre} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  ) : (
                    <i className="fa fa-building" style={{ fontSize: '2.5em', color: '#bdc3c7' }}></i>
                  )}
                </div>
                
                <div
                  style={{
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '1.1em',
                    color: '#2c3e50',
                    lineHeight: '1.3',
                    marginBottom: '8px'
                  }}
                >
                  {cliente.nombre}
                </div>

                {/* Description with Read More (P16) - Smooth Animation */}
                <div style={{
                    fontSize: '0.85em',
                    color: '#666',
                    textAlign: 'center',
                    marginBottom: '10px',
                    lineHeight: '1.4',
                    position: 'relative',
                    width: '100%'
                }}>
                    <div 
                        style={{
                            maxHeight: isExpanded ? '500px' : '48px', // Approx 3 lines
                            overflow: 'hidden',
                            transition: 'max-height 0.4s ease-in-out',
                            textOverflow: isExpanded ? 'clip' : 'ellipsis'
                        }}
                    >
                        {description}
                    </div>

                    {description.length > 80 && (
                      <div 
                        onClick={(e) => toggleDescription(cliente.id, e)} 
                        style={{
                            color:'#1565c0', 
                            cursor:'pointer', 
                            fontSize:'0.9em', 
                            marginTop:'4px',
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center',
                            gap:'4px'
                        }}
                      >
                        {isExpanded ? (
                            <>Ver menos <i className="fa fa-chevron-up" style={{fontSize:'10px'}}></i></>
                        ) : (
                            <>Ver más <i className="fa fa-chevron-down" style={{fontSize:'10px'}}></i></>
                        )}
                      </div>
                    )}
                </div>

                {/* P18: Route Info Example (Mock Data as Backend doesn't provide it yet) */}
                <div style={{width:'100%', marginBottom:'15px', padding:'0 5px'}}>
                   <div style={{display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#999',marginBottom:'3px'}}>
                      <span>BOG</span>
                      <span>MED</span>
                   </div>
                   <div style={{width:'100%', height:'4px', background:'#eee', borderRadius:'2px', overflow:'hidden'}}>
                      <div style={{width:'65%', height:'100%', background:'#4caf50'}}></div>
                   </div>
                   <div style={{textAlign:'center', fontSize:'10px', color:'#4caf50', marginTop:'2px'}}>En Ruta (65%)</div>
                </div>
                
                <div style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '8px 0',
                    background: '#e3f2fd',
                    color: '#1565c0',
                    borderRadius: '8px',
                    fontSize: '0.9em',
                    fontWeight: '600',
                    transition: 'background 0.2s'
                }}>
                  Acceder <i className="fa fa-arrow-right" style={{marginLeft:'4px'}}></i>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
