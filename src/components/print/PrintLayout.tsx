import React from 'react';
import { cn } from '@/lib/utils';
type PageSize = 'A4' | 'Letter' | 'Legal';
type Orientation = 'portrait' | 'landscape';
interface PrintLayoutProps { children: React.ReactNode; pageSize?: PageSize; orientation?: Orientation; margin?: string; className?: string; }
const pageSizes: Record<PageSize, { portrait: string; landscape: string }> = {
  A4: { portrait: 'w-[210mm] min-h-[297mm]', landscape: 'w-[297mm] min-h-[210mm]' },
  Letter: { portrait: 'w-[8.5in] min-h-[11in]', landscape: 'w-[11in] min-h-[8.5in]' },
  Legal: { portrait: 'w-[8.5in] min-h-[14in]', landscape: 'w-[14in] min-h-[8.5in]' }
};
export function PrintLayout({ children, pageSize = 'A4', orientation = 'portrait', margin = '20mm', className }: PrintLayoutProps) {
  return (
    <div className={cn("bg-white print:bg-white", pageSizes[pageSize][orientation], className)} style={{ padding: margin }}>
      {children}
    </div>
  );
}
