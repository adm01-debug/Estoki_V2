import { useState, useMemo, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

interface UseTableOptions<T> {
  data: T[];
  initialPageSize?: number;
  defaultSort?: SortConfig<T> | null;
  filterFn?: (item: T, query: string) => boolean;
}

export function useTable<T extends Record<string, any>>({
  data,
  initialPageSize = 10,
  defaultSort = { key: null, direction: 'asc' },
  filterFn
}: UseTableOptions<T>) {
  const [query, setQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(defaultSort || { key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 1. Filtragem
  const filteredData = useMemo(() => {
    if (!query) return data;

    if (filterFn) {
      return data.filter(item => filterFn(item, query));
    }

    const lowerQuery = query.toLowerCase();
    return data.filter(item => {
      return Object.values(item).some(val => 
        String(val ?? '').toLowerCase().includes(lowerQuery)
      );
    });
  }, [data, query, filterFn]);

  // 2. Ordenação
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      
      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // 3. Paginação
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handlers
  const handleSort = useCallback((key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  return {
    // State
    query,
    setQuery,
    globalFilter: query,
    setGlobalFilter: setQuery,
    sortConfig,
    currentPage,
    setCurrentPage: goToPage,
    pageSize,
    setPageSize,
    selectedIds: Array.from(selectedIds),
    
    // Data
    data: paginatedData,
    filteredData,
    sortedData,
    paginatedData,
    totalItems: sortedData.length,
    totalPages,
    
    // Actions
    handleSort,
    toggleSelection,
    selectAll,
    clearSelection,
    goToPage,
    
    // Helpers
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    isSelected: (id: string) => selectedIds.has(id),
  };
}
