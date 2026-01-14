'use client';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Share2, Edit, CheckCircle, Clock, Truck } from 'lucide-react';

/**
 * Página de detalle de operación
 * Ruta: /operaciones/[id]/page.js
 */
export default function OperacionDetalle({ params }) {
  const router = useRouter();
  const { id } = params;
  
  // P17: Document State
  const [files, setFiles] = useState([
      { id: 1, name: 'factura_123.pdf', size: '2.3 MB', type: 'application/pdf' },
      { id: 2, name: 'foto_vehiculo.jpg', size: '1.1 MB', type: 'image/jpeg' }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setIsUploading(true);
      setUploadProgress(0);
      
      // Mock upload progress
      const interval = setInterval(() => {
          setUploadProgress(prev => {
              if (prev >= 100) {
                  clearInterval(interval);
                  setIsUploading(false);
                  setFiles(prevFiles => [
                      ...prevFiles, 
                      { 
                          id: Date.now(), 
                          name: file.name, 
                          size: (file.size / 1024 / 1024).toFixed(2) + ' MB', 
                          type: file.type 
                      }
                  ]);
                  return 100;
              }
              return prev + 10;
          });
      }, 200);
  };

  const handleDeleteFile = (fileId) => {
      if(confirm('¿Estás seguro de eliminar este documento?')) {
          setFiles(prev => prev.filter(f => f.id !== fileId));
      }
  };
  
  // TODO: Reemplazar con useQuery cuando esté el endpoint
  const operacion = {
    id: id,
    nombre: `Operación #${id}`,
    estado: 'EN_PROCESO',
    cliente: { nombre: 'Cliente Ejemplo' },
    vehiculo: { placa: 'ABC123' },
    conductor: { nombre: 'Juan Pérez' },
    fechaInicio: '2025-12-20',
    fechaFin: '2025-12-25',
    descripcion: 'Descripción de la operación...',
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      PENDIENTE: { color: '#FFA726', label: 'Pendiente', icon: Clock },
      EN_PROCESO: { color: '#42A5F5', label: 'En Proceso', icon: Truck },
      COMPLETADA: { color: '#66BB6A', label: 'Completada', icon: CheckCircle },
    };
    const data = estados[estado] || estados.PENDIENTE;
    const Icon = data.icon;
    
    return (
      <span className="estado-badge" style={{ background: data.color }}>
        <Icon size={16} />
        {data.label}
      </span>
    );
  };

  return (
    <div className="operacion-detalle">
      {/* Header */}
      <div className="operacion-header">
        <div className="operacion-header-left">
          <button onClick={() => router.back()} className="btn-back">
            <ArrowLeft size={20} />
            Volver
          </button>
          <div>
            <h1>{operacion.nombre}</h1>
            {getEstadoBadge(operacion.estado)}
          </div>
        </div>
        <div className="operacion-header-actions">
          <button className="btn-secondary">
            <Edit size={18} />
            Editar
          </button>
          <button className="btn-secondary">
            <Download size={18} />
            Exportar PDF
          </button>
          <button className="btn-secondary">
            <Share2 size={18} />
            Compartir
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="operacion-content">
        {/* Información básica */}
        <div className="operacion-card">
          <h2>Información General</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Cliente</span>
              <span className="info-value">{operacion.cliente.nombre}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Vehículo</span>
              <span className="info-value">{operacion.vehiculo.placa}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Conductor</span>
              <span className="info-value">{operacion.conductor.nombre}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Fecha Inicio</span>
              <span className="info-value">{operacion.fechaInicio}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Fecha Fin</span>
              <span className="info-value">{operacion.fechaFin}</span>
            </div>
            <div className="info-item full-width">
              <span className="info-label">Descripción</span>
              <span className="info-value">{operacion.descripcion}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="operacion-card">
          <h2>Timeline de Estados</h2>
          <div className="timeline">
            <div className="timeline-item completed">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <strong>Operación Creada</strong>
                  <span className="timeline-date">20/12/2025 10:00 AM</span>
                </div>
                <p>Creada por Admin</p>
              </div>
            </div>
            <div className="timeline-item completed">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <strong>Iniciada</strong>
                  <span className="timeline-date">20/12/2025 02:00 PM</span>
                </div>
                <p>Iniciada por Juan Pérez</p>
              </div>
            </div>
            <div className="timeline-item active">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <strong>En Proceso</strong>
                  <span className="timeline-date">Ahora</span>
                </div>
                <p>En ruta hacia destino</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentos (P17) */}
        <div className="operacion-card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
              <h2 style={{margin:0}}>Documentos ({files.length})</h2>
              {files.length > 0 && (
                  <label className="btn-primary" style={{cursor:'pointer', fontSize:'0.9em', padding:'6px 12px'}}>
                      + Subir Documento
                       <input type="file" hidden onChange={handleFileUpload} accept=".pdf,.jpg,.png,.docx" />
                  </label>
              )}
          </div>
          
          {isUploading && (
              <div style={{padding:'20px', textAlign:'center', background:'#f9f9f9', borderRadius:'8px', marginBottom:'15px'}}>
                   <i className="fa fa-spinner fa-spin" style={{fontSize:'24px', color:'#1565c0', marginBottom:'10px'}}></i>
                   <p style={{margin:'5px 0', fontSize:'0.9em', color:'#666'}}>Subiendo documento... {uploadProgress}%</p>
                   <div style={{width:'100%', height:'6px', background:'#eee', borderRadius:'3px', overflow:'hidden', marginTop:'10px'}}>
                       <div style={{width:`${uploadProgress}%`, height:'100%', background:'#1565c0', transition:'width 0.3s'}}></div>
                   </div>
              </div>
          )}

          {files.length === 0 && !isUploading ? (
              <div className="documentos-empty" style={{
                  padding: '30px', 
                  textAlign: 'center', 
                  background: '#f8f9fa', 
                  borderRadius: '8px', 
                  border: '2px dashed #ddd'
              }}>
                <div style={{fontSize:'32px', marginBottom:'10px'}}>📎</div>
                <p style={{color:'#666', marginBottom:'15px'}}>No hay documentos adjuntos</p>
                <label className="btn-primary" style={{cursor:'pointer', display:'inline-block'}}>
                     + Subir Documento
                     <input type="file" hidden onChange={handleFileUpload} accept=".pdf,.jpg,.png,.docx" />
                </label>
                <p style={{fontSize:'0.8em', color:'#999', marginTop:'10px'}}>Formatos: PDF, JPG, PNG, DOCX (Máx 10MB)</p>
              </div>
          ) : (
              <div className="file-list">
                  {files.map(file => (
                      <div key={file.id} style={{
                          display:'flex', 
                          alignItems:'center', 
                          padding:'12px', 
                          borderBottom:'1px solid #eee',
                          background:'#fff'
                      }}>
                          <div style={{marginRight:'15px', color:'#1565c0', fontSize:'20px'}}>
                              {file.type.includes('pdf') ? <i className="fa fa-file-pdf"></i> : 
                               file.type.includes('image') ? <i className="fa fa-file-image"></i> : 
                               <i className="fa fa-file-alt"></i>}
                          </div>
                          <div style={{flex:1}}>
                              <div style={{fontWeight:'500', color:'#333'}}>{file.name}</div>
                              <div style={{fontSize:'0.8em', color:'#888'}}>{file.size}</div>
                          </div>
                          <div style={{display:'flex', gap:'10px'}}>
                               <button className="btn-icon" title="Descargar" style={{background:'none', border:'none', cursor:'pointer', color:'#666'}}>
                                   <Download size={16} />
                               </button>
                               <button 
                                   className="btn-icon" 
                                   title="Eliminar" 
                                   onClick={() => handleDeleteFile(file.id)}
                                   style={{background:'none', border:'none', cursor:'pointer', color:'#d32f2f'}}
                               >
                                   <i className="fa fa-trash"></i>
                               </button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
        </div>

        {/* Comentarios */}
        <div className="operacion-card">
          <h2>Comentarios</h2>
          <div className="comentarios-empty">
            <p>No hay comentarios aún</p>
            <textarea placeholder="Agregar un comentario..." rows="3"></textarea>
            <button className="btn-primary">Publicar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
