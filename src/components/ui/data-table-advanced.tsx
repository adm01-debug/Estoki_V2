/**
 * DataTable Avançado
 * Tabela com sorting, filtering, pagination, selection, export
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Download,
  Filter,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useExport } from '@/hooks/use-export';
import { cn } from '@/lib/utils';

// Tipos
export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  exportFormat?: (value: unknown, row: Record<string, unknown>) => string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField?: keyof T;
  // Features
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  exportable?: boolean;
  paginated?: boolean;
  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];
  // Selection
  onSelectionChange?: (selectedRows: T[]) => void;
  // Sorting
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  // Styling
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  // Actions
  onRowClick?: (row: T) => void;
  // Export
  exportFilename?: string;
  // Empty state
  emptyMessage?: string;
  // Loading
  isLoading?: boolean;
}

// Componente principal
export function DataTableAdvanced<T extends Record<string, any>>({
  data,
  columns,
  keyField = 'id' as keyof T,
  sortable = true,
  filterable = true,
  selectable = false,
  exportable = true,
  paginated = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onSelectionChange,
  defaultSort,
  onSort,
  className,
  rowClassName,
  onRowClick,
  exportFilename = 'data',
  emptyMessage = 'Nenhum registro encontrado',
  isLoading = false,
}: DataTableProps<T>) {
  // State
  const [globalFilter, setGlobalFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    defaultSort || null
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [String(col.key)]: true }), {})
  );

  const { exportToPDF, exportToExcel, exportToCSV, isExporting } = useExport();

  // Filtrar dados
  const filteredData = useMemo(() => {
    if (!globalFilter) return data;
    
    const searchLower = globalFilter.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        if (!col.filterable === false) return false;
        const value = row[col.key as keyof T];
        return String(value ?? '').toLowerCase().includes(searchLower);
      })
    );
  }, [data, globalFilter, columns]);

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
      const newConfig = { key, direction: newDirection };
      onSort?.(key, newDirection);
      return newConfig;
    });
  }, [columns, sortable, onSort]);

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
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

  const handleExport = useCallback(async (format: 'pdf' | 'excel' | 'csv') => {
    const exportColumns = columns
      .filter(col => columnVisibility[String(col.key)])
      .map(col => ({
        key: String(col.key),
        header: col.header,
        format: col.exportFormat,
      }));

    const options = { filename: exportFilename, columns: exportColumns };
    
    switch (format) {
      case 'pdf':
        await exportToPDF(sortedData, options);
        break;
      case 'excel':
        await exportToExcel(sortedData, options);
        break;
      case 'csv':
        exportToCSV(sortedData, options);
        break;
    }
  }, [columns, columnVisibility, exportFilename, sortedData, exportToPDF, exportToExcel, exportToCSV]);

  // Render sort icon
  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  // Colunas visíveis
  const visibleColumns = columns.filter(col => columnVisibility[String(col.key)]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        {filterable && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map(col => (
                <DropdownMenuItem
                  key={String(col.key)}
                  onClick={() => setColumnVisibility(prev => ({
                    ...prev,
                    [String(col.key)]: !prev[String(col.key)],
                  }))}
                >
                  <Checkbox
                    checked={columnVisibility[String(col.key)]}
                    className="mr-2"
                  />
                  {col.header}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export */}
          {exportable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {visibleColumns.map(col => (
                <TableHead
                  key={String(col.key)}
                  style={{ width: col.width }}
                  className={cn(
                    col.sortable !== false && sortable && "cursor-pointer select-none",
                    col.align === 'center' && "text-center",
                    col.align === 'right' && "text-right"
                  )}
                  onClick={() => handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable !== false && sortable && renderSortIcon(String(col.key))}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="text-center py-8 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={String(row[keyField])}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    rowClassName?.(row, index)
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.has(String(row[keyField]))}
                        onCheckedChange={() => handleSelectRow(row)}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map(col => (
                    <TableCell
                      key={String(col.key)}
                      className={cn(
                        col.align === 'center' && "text-center",
                        col.align === 'right' && "text-right"
                      )}
                    >
                      {col.render
                        ? col.render(row[col.key as keyof T], row, index)
                        : String(row[col.key as keyof T] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="h-8 rounded-md border px-2 text-sm"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size} por página</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTableAdvanced;
