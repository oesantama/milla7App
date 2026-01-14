'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente de paginación reutilizable
 * 
 * Props:
 * - currentPage: número de página actual (1-indexed)
 * - totalPages: total de páginas
 * - onPageChange: callback(page) cuando cambia la página
 * - itemsPerPage: items por página (opcional, para mostrar info)
 * - totalItems: total de items (opcional)
 */
export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0
}) {
  const maxVisiblePages = 5;
  
  // Calcular rango de páginas visibles
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        {totalItems > 0 && (
          <span>Mostrando {startItem}-{endItem} de {totalItems} registros</span>
        )}
      </div>
      
      <nav className="pagination" aria-label="Paginación">
        {/* Primera página */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="pagination-btn"
          aria-label="Primera página"
        >
          Primera
        </button>
        
        {/* Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn pagination-arrow"
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
          Anterior
        </button>
        
        {/* Números de página */}
        {startPage > 1 && <span className="pagination-ellipsis">...</span>}
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`pagination-btn pagination-number ${page === currentPage ? 'active' : ''}`}
            aria-label={`Página ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && <span className="pagination-ellipsis">...</span>}
        
        {/* Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn pagination-arrow"
          aria-label="Página siguiente"
        >
          Siguiente
          <ChevronRight size={16} />
        </button>
        
        {/* Última página */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
          aria-label="Última página"
        >
          Última
        </button>
      </nav>
    </div>
  );
}
