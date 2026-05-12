import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalItems: number;
  onPageChange: (page: number | ((p: number) => number)) => void;
  onPageSizeChange: (size: number) => void;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions,
  totalItems,
  onPageChange,
  onPageSizeChange
}: DataTablePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalItems)} de {totalItems}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="h-8 rounded-md border px-2 text-sm bg-background"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size} por página</option>
          ))}
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(p => Math.max(1, p - 1))}
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
          onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}