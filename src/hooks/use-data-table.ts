import { useState, useMemo, useCallback } from 'react';
import { Column, SortConfig } from '@/types/data-table';

interface UseDataTableOptions<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  initialPageSize: number;
  defaultSort?: SortConfig | null;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  paginated?: boolean;
  filterable?: boolean;
  sortable?: boolean;
}

 export function useDataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  initialPageSize,
  defaultSort,
  onSort,
  onSelectionChange,
  paginated,
  filterable,
  sortable
}: UseDataTableOptions<T>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [String(col.key)]: true }), {})
  );

  // Filtrar dados
  const filteredData = useMemo(() => {
    if (!globalFilter) return data;
    
    const searchLower = globalFilter.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        if (col.filterable === false || !filterable) return false;
        const value = row[col.key as keyof T];
        return String(value ?? '').toLowerCase().includes(searchLower);
      })
    );
  }, [data, globalFilter, columns, filterable]);

  // Ordenar dados
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];
      
      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Paginar dados
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;
    
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, paginated]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handlers
  const handleSort = useCallback((key: string) => {
    const column = columns.find(c => c.key === key);
    if (!column?.sortable && sortable) {
      if (column?.sortable === false) return;
    } else if (!sortable) return;

    setSortConfig(prev => {
      const newDirection: 'asc' | 'desc' = prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
      const newConfig: SortConfig = { key, direction: newDirection };
      onSort?.(key, newDirection);
      return newConfig;
    });
  }, [columns, sortable, onSort]);

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const newSelected = new Set(paginatedData.map(row => String(row[keyField])));
      setSelectedRows(newSelected);
      onSelectionChange?.(paginatedData);
    }
  }, [paginatedData, selectedRows.size, keyField, onSelectionChange]);

  const handleSelectRow = useCallback((row: T) => {
    const key = String(row[keyField]);
    const newSelected = new Set(selectedRows);
    
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    
    setSelectedRows(newSelected);
    onSelectionChange?.(data.filter(r => newSelected.has(String(r[keyField]))));
  }, [selectedRows, keyField, data, onSelectionChange]);

  const toggleColumnVisibility = useCallback((key: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  return {
    globalFilter,
    setGlobalFilter,
    sortConfig,
    selectedRows,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    columnVisibility,
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    handleSort,
    handleSelectAll,
    handleSelectRow,
    toggleColumnVisibility
  };
}