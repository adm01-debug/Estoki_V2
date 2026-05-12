import React from 'react';

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

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}