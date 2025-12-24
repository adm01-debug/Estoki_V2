import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  pagination = true,
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');

  const filteredData = React.useMemo(() => {
    let result = [...data];
    if (search) {
      result = result.filter((item) =>
        Object.values(item).some((v) =>
          String(v).toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, sortKey, sortDir]);

  const pageCount = Math.ceil(filteredData.length / pageSize);
  const pagedData = pagination
    ? filteredData.slice(page * pageSize, (page + 1) * pageSize)
    : filteredData;

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.key)} onClick={() => col.sortable && (setSortKey(String(col.key)), setSortDir(sortDir === 'asc' ? 'desc' : 'asc'))} className={col.sortable ? 'cursor-pointer hover:bg-muted' : ''}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.map((item, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={String(col.key)}>
                    {col.render ? col.render(item) : item[col.key as keyof T]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination && pageCount > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Página {page + 1} de {pageCount}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={() => setPage(0)} disabled={page === 0}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => setPage(page - 1)} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => setPage(page + 1)} disabled={page >= pageCount - 1}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => setPage(pageCount - 1)} disabled={page >= pageCount - 1}><ChevronsRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
