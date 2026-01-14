'use client';
import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

export default function MasterImportControl({ modelName, headers, onSuccess }) {
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [validationErrors, setValidationErrors] = useState({}); // Map of rowIdx -> errorMessage
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const { token } = useAuth();

  const getExampleData = () => {
    switch(modelName) {
        case 'articulos': return [{Codigo: 'A001', Descripcion: 'MARTILLO', 'UM General': 'UNIDAD', 'UM Intermedia': 'CAJA', 'UM Especial': 'PAQUETE', Categoria: 'FERRETERIA'}];
        case 'vehiculos': return [{Placa: 'BOG123', Propietario: 'JUAN PEREZ', Modelo: '2022', 'Tipo Vehiculo': 'CAMION'}];
        case 'conductores': return [{Cedula: '1234567890', Nombre: 'PEDRO GOMEZ', Celular: '3001234567', Licencia: 'C2'}];
        case 'clientes': return [{Nombre: 'CONSTRUCTORA XYZ'}];
        case 'tipos_vehiculos': return [{Descripcion: 'CAMIONETA 4X4'}];
        case 'categorias': return [{Descripcion: 'HERRAMIENTAS MANUALES'}];
        case 'unidades_medida': return [{Descripcion: 'KILOGRAMO', Abreviatura: 'KG'}];
        default: return [];
    }
  };

  const handleDownloadTemplate = () => {
    const exampleData = getExampleData();
    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `Plantilla_${modelName}.xlsx`);
  };

  const handleExportPreview = () => {
      // Create a dataset that includes the validation notes
      const exportData = previewData.map((row, i) => {
          const error = validationErrors[i];
          return {
              ...row,
              'Notas Validación': error || 'OK'
          };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Validacion");
      XLSX.writeFile(wb, `Validacion_${modelName}.xlsx`);
  };

  const validateData = async (data) => {
    setIsValidating(true);
    setValidationErrors({});
    try {
        const res = await fetch('/api/core/import-master/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                model: modelName,
                data: data,
                dry_run: true // Ask backend to only validate
            })
        });
        const json = await res.json();
        // If "errors" is array (normal mode) or dry_run returns structured errors?
        // Backend returns: { "status": "success/error", "errors": ["Fila X: error", ...], "dry_run": true }
        if (json.errors && Array.isArray(json.errors)) {
            const errorMap = {};
            json.errors.forEach(errStr => {
                const match = errStr.match(/Fila (\d+): (.*)/);
                if (match) {
                    const rowIdx = parseInt(match[1]) - 1; 
                    errorMap[rowIdx] = match[2];
                }
            });
            setValidationErrors(errorMap);
        }
    } catch (e) {
        console.error("Validation error:", e);
    } finally {
        setIsValidating(false);
    }
  };

  const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (!selectedFile) return;

      setFile(selectedFile);
      setResult(null);
      setValidationErrors({});

      const reader = new FileReader();
      reader.onload = (evt) => {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'array' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          setPreviewData(data);
          setShowModal(true);
          
          // Trigger validation
          validateData(data);
      };
      reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = async () => {
      if (!previewData || previewData.length === 0) return;
      if (Object.keys(validationErrors).length > 0) {
          const result = await Swal.fire({
              title: 'Registros con errores',
              text: "Hay filas con errores que no se importarán. ¿Desea continuar importando solo las válidas?",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#1565c0',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Sí, importar válidas',
              cancelButtonText: 'Cancelar'
          });

          if (!result.isConfirmed) {
             return;
          }
      }

      setLoading(true);
      try {
          const res = await fetch('/api/core/import-master/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                  model: modelName,
                  data: previewData
              })
          });
          const json = await res.json();
          if (res.ok) {
              setResult({ type: 'success', message: json.message });
              if (onSuccess) onSuccess();
              setTimeout(() => {
                  closeModal();
              }, 2000);
          } else {
              setResult({ type: 'error', message: json.message || 'Error al importar', details: json.errors });
          }
      } catch (e) {
          setResult({ type: 'error', message: e.message });
      } finally {
          setLoading(false);
      }
  };

  const closeModal = () => {
      setShowModal(false);
      setFile(null);
      setPreviewData([]);
      setResult(null);
      setValidationErrors({});
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{display:'inline-flex', gap:'10px'}}>
      <input 
        type="file" 
        accept=".xlsx, .xls, .csv" 
        style={{display:'none'}} 
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <button 
        onClick={handleDownloadTemplate} 
        style={{padding:'12px 24px',border:'1px solid #1976d2',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',background:'#e3f2fd',color:'#1976d2'}}
        title="Descargar Plantilla de Ejemplo"
      >
        <i className="fa fa-download" style={{marginRight:'8px'}}></i> Plantilla
      </button>

      <button 
        onClick={() => fileInputRef.current.click()} 
        style={{padding:'12px 24px',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',background:'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',color:'#fff'}}
        title="Cargar Archivo Excel"
      >
        <i className="fa fa-file-import" style={{marginRight:'8px'}}></i> Importar Excel
      </button>

      {showModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10000}}>
           <div style={{background:'#fff',borderRadius:'16px',padding:'30px',maxWidth:'900px',width:'90%',maxHeight:'90vh',overflowY:'auto', boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                   <h3 style={{margin:0, color:'#1565c0'}}>Previsualización Importación ({modelName})</h3>
                   {isValidating && <span style={{color:'#f57c00', fontSize:'14px'}}><i className="fa fa-sync fa-spin"></i> Validando datos...</span>}
               </div>
               
               <p style={{color:'#666', marginBottom:'15px'}}>
                   Se han detectado <strong>{previewData.length}</strong> registros. 
                   {Object.keys(validationErrors).length > 0 && <span style={{color:'#d32f2f', marginLeft:'10px'}}><strong>{Object.keys(validationErrors).length}</strong> registros con errores.</span>}
               </p>
               
               <div style={{maxHeight:'400px', overflow:'auto', border:'1px solid #eee', marginBottom:'20px', borderRadius:'8px'}}>
                   <table style={{width:'100%', borderCollapse:'collapse', fontSize:'13px'}}>
                       <thead style={{position:'sticky', top:0, zIndex:1}}>
                           <tr style={{background:'#f5f5f5'}}>
                               {headers.map(h => <th key={h} style={{padding:'10px', borderBottom:'1px solid #ddd', textAlign:'left', fontWeight:'600', color:'#444'}}>{h}</th>)}
                               <th style={{padding:'10px', borderBottom:'1px solid #ddd', minWidth:'200px'}}>Notas Validación</th>
                           </tr>
                       </thead>
                       <tbody>
                           {previewData.map((row, i) => {
                               const error = validationErrors[i];
                               // Style: Red background, White text for error rows as requested
                               const rowStyle = error 
                                ? {background:'#d32f2f', color:'#fff'} 
                                : {borderBottom:'1px solid #eee'};
                               
                               return (
                                <tr key={i} style={rowStyle}>
                                    {headers.map(h => <td key={h} style={{padding:'8px', borderBottom: error ? '1px solid #ef9a9a' : '1px solid #eee'}}>{row[h] || row[h.toUpperCase()] || '-'}</td>)}
                                    <td style={{padding:'8px', textAlign:'left', borderBottom: error ? '1px solid #ef9a9a' : '1px solid #eee'}}>
                                        {error ? (
                                            <div style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'12px'}}>
                                                <i className="fa fa-exclamation-triangle"></i> {error}
                                            </div>
                                        ) : (
                                            <div style={{color:'#4caf50', fontSize:'12px'}}>
                                                <i className="fa fa-check"></i> OK
                                            </div>
                                        )}
                                    </td>
                                </tr>
                               );
                           })}
                       </tbody>
                   </table>
               </div>
               
               {Object.keys(validationErrors).length > 0 && (
                   <div style={{padding:'10px', background:'#ffebee', color:'#d32f2f', borderRadius:'8px', marginBottom:'15px', fontSize:'13px'}}>
                       <i className="fa fa-info-circle"></i> <strong>Atención:</strong> Las filas en <b>rojo</b> contienen errores y no se guardarán. Puede descargar el archivo de validación para corregir.
                   </div>
               )}

               {result && (
                   <div style={{padding:'10px', borderRadius:'8px', marginBottom:'15px', background: result.type === 'success' ? '#e8f5e9' : '#ffebee', color: result.type === 'success' ? '#2e7d32' : '#c62828'}}>
                       {result.type === 'success' ? '✅ ' : '❌ '} {result.message}
                       {result.details && (
                           <ul style={{marginTop:'5px', paddingLeft:'20px', fontSize:'12px'}}>
                               {result.details.map((d, k) => <li key={k}>{d}</li>)}
                           </ul>
                       )}
                   </div>
               )}

               <div style={{display:'flex', justifyContent:'space-between', marginTop:'20px'}}>
                   <div>
                       <button onClick={handleExportPreview} style={{padding:'10px 20px', borderRadius:'8px', border:'1px solid #1976d2', background:'#fff', color:'#1976d2', cursor:'pointer', fontWeight:'600'}}>
                            <i className="fa fa-file-excel" style={{marginRight:'5px'}}></i> Exportar Validación
                       </button>
                   </div>
                   <div style={{display:'flex', gap:'10px'}}>
                        <button onClick={closeModal} style={{padding:'10px 20px', borderRadius:'8px', border:'none', background:'#ef5350', color:'#fff', cursor:'pointer', fontWeight:'600'}}>
                                <i className="fa fa-times" style={{marginRight:'5px'}}></i> Cancelar
                        </button>
                        <button 
                            onClick={handleImport} 
                            disabled={loading || isValidating || (result && result.type === 'success')}
                            style={{padding:'10px 20px', borderRadius:'8px', border:'none', background: (loading || isValidating) ? '#ccc' : '#1565c0', color:'#fff', cursor:'pointer', fontWeight:'600'}}
                        >
                            {loading ? 'Procesando...' : isValidating ? 'Validando...' : 'Confirmar Importación'}
                        </button>
                   </div>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}
