/**
 * Hook personalizado para paginación
 * Maneja estado y lógica de paginación
 */
import { useState, useMemo } from 'react';

export function usePagination(data = [], itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);

  return {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}
