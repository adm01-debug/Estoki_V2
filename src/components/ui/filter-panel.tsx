import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface FilterOption { value: string; label: string }
interface FilterConfig { key: string; label: string; type: 'text' | 'select' | 'date' | 'number'; options?: FilterOption[] }
interface FilterPanelProps { filters: FilterConfig[]; values: Record<string, string>; onChange: (key: string, value: string) => void; onClear: () => void; className?: string }

export function FilterPanel({ filters, values, onChange, onClear, className }: FilterPanelProps) {
  const activeCount = Object.values(values).filter(Boolean).length;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className={cn('relative', className)}>
          <Filter className="h-4 w-4 mr-2" /> Filtros
          {activeCount > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">{activeCount}</Badge>}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader>
        <div className="space-y-4 mt-4">
          {filters.map(filter => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-medium">{filter.label}</label>
              {filter.type === 'select' && filter.options ? (
                <Select value={values[filter.key] || ''} onValueChange={v => onChange(filter.key, v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{filter.options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <Input type={filter.type === 'number' ? 'number' : filter.type === 'date' ? 'date' : 'text'} value={values[filter.key] || ''} onChange={e => onChange(filter.key, e.target.value)} />
              )}
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={onClear}><X className="h-4 w-4 mr-2" />Limpar Filtros</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
export default FilterPanel;
