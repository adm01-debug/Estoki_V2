import React from 'react';
import { Search, Settings, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Column } from '@/types/data-table';

interface DataTableToolbarProps<T> {
  filterable: boolean;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  columns: Column<T>[];
  columnVisibility: Record<string, boolean>;
  toggleColumnVisibility: (key: string) => void;
  exportable: boolean;
  isExporting: boolean;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}

export function DataTableToolbar<T>({
  filterable,
  globalFilter,
  setGlobalFilter,
  columns,
  columnVisibility,
  toggleColumnVisibility,
  exportable,
  isExporting,
  onExport
}: DataTableToolbarProps<T>) {
  return (
    <div className="flex items-center justify-between gap-4">
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
                onClick={() => toggleColumnVisibility(String(col.key))}
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

        {exportable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('pdf')}>
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('excel')}>
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('csv')}>
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}