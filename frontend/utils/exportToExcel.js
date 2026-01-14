// frontend/utils/exportToExcel.js
import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName) => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  // Create worksheet from JSON (data already has formatted headers as keys)
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};