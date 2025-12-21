import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { NoResults, NoData } from "@/components/ui/empty-state";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string }>({ data, columns, loading, emptyMessage, onRowClick }: DataTableProps<T>) {
  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => <TableHead key={col.key as string}>{col.header}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              {columns.map(col => <TableCell key={col.key as string}><Skeleton className="h-4 w-full" /></TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (!data.length) {
    return <NoData />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map(col => <TableHead key={col.key as string} className={col.className}>{col.header}</TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(row => (
          <TableRow key={row.id} onClick={() => onRowClick?.(row)} className={onRowClick ? "cursor-pointer hover:bg-muted" : ""}>
            {columns.map(col => (
              <TableCell key={col.key as string} className={col.className}>
                {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
