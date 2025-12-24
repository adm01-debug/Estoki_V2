import React from 'react';
import { cn } from '@/lib/utils';
interface PrintFooterProps { pageNumber?: number; totalPages?: number; text?: string; showPageNumbers?: boolean; className?: string; }
export function PrintFooter({ pageNumber, totalPages, text, showPageNumbers = true, className }: PrintFooterProps) {
  return (
    <footer className={cn("flex justify-between items-center pt-4 mt-4 border-t print:border-black text-sm text-muted-foreground", className)}>
      <div>{text}</div>
      {showPageNumbers && pageNumber && <div>Página {pageNumber}{totalPages && ` de ${totalPages}`}</div>}
    </footer>
  );
}
