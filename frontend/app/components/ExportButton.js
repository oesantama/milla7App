'use client';

import { Download, FileText, Table, FileJson } from 'lucide-react';
import { useExport } from '../utils/export';
import toast from 'react-hot-toast';

/**
 * Componente visual de exportación con menú dropdown
 * Facilita exportar datos a múltiples formatos
 */
export default function ExportButton({ data, filename = 'export', label = 'Exportar' }) {
  const { exportData } = useExport(toast);
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format) => {
    exportData(data, format, filename);
    setIsOpen(false);
  };

  return (
    <div className="export-button-container">
      <button
        className="btn-secondary export-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Download size={18} />
        {label}
      </button>

      {isOpen && (
        <>
          <div className="export-overlay" onClick={() => setIsOpen(false)} />
          <div className="export-menu">
            <button
              className="export-option"
              onClick={() => handleExport('csv')}
            >
              <FileText size={18} />
              <div>
                <div className="export-title">CSV</div>
                <div className="export-subtitle">Comma Separated Values</div>
              </div>
            </button>
            <button
              className="export-option"
              onClick={() => handleExport('excel')}
            >
              <Table size={18} />
              <div>
                <div className="export-title">Excel</div>
                <div className="export-subtitle">Microsoft Excel (.xlsx)</div>
              </div>
            </button>
            <button
              className="export-option"
              onClick={() => handleExport('json')}
            >
              <FileJson size={18} />
              <div>
                <div className="export-title">JSON</div>
                <div className="export-subtitle">JavaScript Object Notation</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Import necesario
import { useState } from 'react';
