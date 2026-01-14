/**
 * Utilidad para exportar datos a diferentes formatos
 */

/**
 * Exportar array de objetos a CSV
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Obtener headers de las keys del primer objeto
  const headers = Object.keys(data[0]);
  
  // Crear filas CSV
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escapar comas y comillas
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Exportar a Excel (usando CSV con extensión .xlsx para simplicidad)
 * Para Excel real, usar librería como xlsx
 */
export function exportToExcel(data, filename = 'export.xlsx') {
  exportToCSV(data, filename);
}

/**
 * Exportar a JSON
 */
export function exportToJSON(data, filename = 'export.json') {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Crear y descargar archivo
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpiar URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Hook para usar exportación con toast feedback
 */
export function useExport(toast) {
  const handleExport = (data, format = 'csv', filename) => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultFilename = `export_${timestamp}`;
      
      switch (format.toLowerCase()) {
        case 'csv':
          exportToCSV(data, `${filename || defaultFilename}.csv`);
          break;
        case 'excel':
        case 'xlsx':
          exportToExcel(data, `${filename || defaultFilename}.xlsx`);
          break;
        case 'json':
          exportToJSON(data, `${filename || defaultFilename}.json`);
          break;
        default:
          throw new Error(`Formato no soportado: ${format}`);
      }
      
      toast?.success(`Datos exportados a ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exportando:', error);
      toast?.error('Error al exportar datos');
    }
  };

  return { exportData: handleExport };
}
