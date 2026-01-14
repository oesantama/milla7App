'use client';

import { useState, useCallback } from 'react';
import { Upload, X, File, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Componente de upload de archivos con drag & drop
 * Soporta múltiples archivos y validación
 */
export default function FileUpload({
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.xlsx', '.docx'],
  maxFiles = 5,
  onUpload,
}) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file) => {
    // Validar tamaño
    if (file.size > maxSize) {
      toast.error(`${file.name} excede el tamaño máximo (${maxSize / 1024 / 1024}MB)`);
      return false;
    }

    // Validar tipo
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      toast.error(`Tipo de archivo no permitido: ${fileExt}`);
      return false;
    }

    return true;
  };

  const handleFiles = (fileList) => {
    const validFiles = Array.from(fileList).filter(validateFile);
    
    if (files.length + validFiles.length > maxFiles) {
      toast.error(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    const newFiles = validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`${validFiles.length} archivo(s) agregado(s)`);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  }, [files]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success('Archivo eliminado');
  };

  const handleUploadAll = async () => {
    // TODO: Implementar upload real al backend
    const uploadPromises = files.map(async (fileData) => {
      // Simular upload
      return new Promise((resolve) => {
        setTimeout(() => {
          setFiles(prev =>
            prev.map(f =>
              f.id === fileData.id ? { ...f, status: 'uploaded' } : f
            )
          );
          resolve();
        }, 1000);
      });
    });

    await Promise.all(uploadPromises);
    toast.success('Todos los archivos subidos');
    onUpload?.(files);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="file-upload">
      {/* Drop zone */}
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload size={48} />
        <p className="drop-zone-title">
          Arrastra archivos aquí o haz click para seleccionar
        </p>
        <p className="drop-zone-subtitle">
          Máximo {maxFiles} archivos • Tamaño máx: {maxSize / 1024 / 1024}MB
        </p>
        <p className="drop-zone-types">
          Formatos: {allowedTypes.join(', ')}
        </p>
        <input
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleInputChange}
          className="file-input-hidden"
        />
      </div>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <h4>Archivos seleccionados ({files.length})</h4>
            <button
              className="btn-primary btn-sm"
              onClick={handleUploadAll}
              disabled={files.every(f => f.status === 'uploaded')}
            >
              Subir Todos
            </button>
          </div>
          {files.map(fileData => (
            <div key={fileData.id} className="file-item">
              <div className="file-icon">
                {fileData.status === 'uploaded' ? (
                  <CheckCircle size={24} color="#66BB6A" />
                ) : (
                  <File size={24} />
                )}
              </div>
              <div className="file-info">
                <div className="file-name">{fileData.name}</div>
                <div className="file-size">{formatFileSize(fileData.size)}</div>
              </div>
              {fileData.status !== 'uploaded' && (
                <button
                  className="btn-remove-file"
                  onClick={() => removeFile(fileData.id)}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
