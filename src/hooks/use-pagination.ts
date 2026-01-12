import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  paginate: <T>(items: T[]) => T[];
  pageNumbers: number[];
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn<any> {
  const { initialPage = 1, initialPageSize = 10, totalItems: externalTotal } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [internalTotal, setInternalTotal] = useState(0);

  const totalItems = externalTotal ?? internalTotal;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  const nextPage = useCallback(() => hasNextPage && setCurrentPage(p => p + 1), [hasNextPage]);
  const prevPage = useCallback(() => hasPrevPage && setCurrentPage(p => p - 1), [hasPrevPage]);
  const firstPage = useCallback(() => setCurrentPage(1), []);
  const lastPage = useCallback(() => setCurrentPage(totalPages), [totalPages]);

  const paginate = useCallback(<T>(items: T[]): T[] => {
    if (externalTotal === undefined) setInternalTotal(items.length);
    return items.slice(startIndex, startIndex + pageSize);
  }, [startIndex, pageSize, externalTotal]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return {
    currentPage, pageSize, totalPages, totalItems, startIndex, endIndex,
    hasNextPage, hasPrevPage, setPage, setPageSize, nextPage, prevPage,
    firstPage, lastPage, paginate, pageNumbers
  };
}

export default usePagination;
