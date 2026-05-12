/**
 * DataTable Avançado
 * Tabela com sorting, filtering, pagination, selection, export
 */

import React, { useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import { useExport } from '@/hooks/use-export';
import { cn } from '@/lib/utils';
import { DataTableProps } from '@/types/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTableToolbar } from './data-table/DataTableToolbar';
import { DataTablePagination } from './data-table/DataTablePagination';

// Re-export types for backward compatibility
export type { Column, DataTableProps } from '@/types/data-table';

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
  const {
    globalFilter,
    setGlobalFilter,
    sortConfig,
    selectedRows,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    columnVisibility,
    sortedData,
    paginatedData,
    totalPages,
    handleSort,
    handleSelectAll,
    handleSelectRow,
    toggleColumnVisibility
  } = useDataTable({
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
  });

  const { exportToPDF, exportToExcel, exportToCSV, isExporting } = useExport();

  const handleExport = useCallback(async (format: 'pdf' | 'excel' | 'csv') => {
    const exportColumns = columns
      .filter(col => columnVisibility[String(col.key)])
      .map(col => ({
        key: String(col.key),
        header: col.header,
        format: col.exportFormat,
      }));

    const options = { filename: exportFilename, columns: exportColumns };
    const exportData = sortedData as unknown as Record<string, unknown>[];
    
    switch (format) {
      case 'pdf':
        await exportToPDF(exportData, options);
        break;
      case 'excel':
        await exportToExcel(exportData, options);
        break;
      case 'csv':
        exportToCSV(exportData, options);
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

  const visibleColumns = columns.filter(col => columnVisibility[String(col.key)]);

  return (
    <div className={cn("space-y-4", className)}>
      <DataTableToolbar 
        filterable={filterable}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        columns={columns}
        columnVisibility={columnVisibility}
        toggleColumnVisibility={toggleColumnVisibility}
        exportable={exportable}
        isExporting={isExporting}
        onExport={handleExport}
      />

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

      {paginated && (
        <DataTablePagination 
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          totalItems={sortedData.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      )}
    </div>
  );
}

export default DataTableAdvanced;
