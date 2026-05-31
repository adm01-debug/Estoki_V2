import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface VirtualizedTableProps<T> {
  data: T[];
  columns: {
    header: string;
    cell: (item: T) => React.ReactNode;
    className?: string;
  }[];
  rowHeight?: number;
  height?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function VirtualizedTable<T>({
  data,
  columns,
  rowHeight = 64,
  height = "600px",
  onRowClick,
  className,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  return (
    <div className={cn("overflow-hidden rounded-md border", className)}>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>

      <div ref={parentRef} className="overflow-auto" style={{ height }}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = data[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                className={cn(
                  "absolute left-0 top-0 flex w-full items-center border-b transition-colors hover:bg-muted/50",
                  onRowClick && "cursor-pointer"
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onRowClick?.(item)}
              >
                <div className="flex h-full w-full items-center px-4">
                  {columns.map((col, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 overflow-hidden",
                        col.className,
                        // If it's the last column, we might want text-right alignment support
                        i === columns.length - 1 && "text-right"
                      )}
                    >
                      {col.cell(item)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
