import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
interface BinGridProps { rows: number; columns: number; bins: { row: number; col: number; code: string; status: 'empty' | 'partial' | 'full' | 'blocked'; occupancy?: number }[]; onBinClick?: (row: number, col: number) => void; }
export function BinGrid({ rows, columns, bins, onBinClick }: BinGridProps) {
  const getBin = (row: number, col: number) => bins.find(b => b.row === row && b.col === col);
  const statusColors = { empty: 'bg-green-100 hover:bg-green-200', partial: 'bg-yellow-100 hover:bg-yellow-200', full: 'bg-blue-100 hover:bg-blue-200', blocked: 'bg-red-100 hover:bg-red-200' };
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader><TableRow><TableHead className="w-12"></TableHead>{Array.from({ length: columns }, (_, c) => <TableHead key={c} className="text-center w-16">{String.fromCharCode(65 + c)}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{Array.from({ length: rows }, (_, r) => (
          <TableRow key={r}><TableCell className="font-medium text-center">{r + 1}</TableCell>
            {Array.from({ length: columns }, (_, c) => {
              const bin = getBin(r, c);
              return <TableCell key={c} className={`text-center cursor-pointer transition-colors ${bin ? statusColors[bin.status] : 'bg-muted hover:bg-muted/80'}`} onClick={() => onBinClick?.(r, c)}>{bin ? <div className="text-xs"><div className="font-medium">{bin.code}</div>{bin.occupancy !== undefined && <div>{bin.occupancy}%</div>}</div> : '-'}</TableCell>;
            })}
          </TableRow>
        ))}</TableBody>
      </Table>
      <div className="flex gap-4 mt-4 text-xs">{Object.entries(statusColors).map(([s, c]) => <div key={s} className="flex items-center gap-1"><div className={`w-4 h-4 rounded ${c.split(' ')[0]}`} /><span className="capitalize">{s === 'partial' ? 'Parcial' : s === 'empty' ? 'Vazio' : s === 'full' ? 'Cheio' : 'Bloqueado'}</span></div>)}</div>
    </div>
  );
}
