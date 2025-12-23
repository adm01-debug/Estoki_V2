import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight } from 'lucide-react';
interface YearPickerProps { value?: number; onChange?: (year: number) => void; minYear?: number; maxYear?: number; }
export function YearPicker({ value, onChange, minYear = 2000, maxYear = 2050 }: YearPickerProps) {
  const [decade, setDecade] = useState(Math.floor((value || new Date().getFullYear()) / 10) * 10);
  const [open, setOpen] = useState(false);
  const years = Array.from({ length: 10 }, (_, i) => decade + i).filter(y => y >= minYear && y <= maxYear);
  return (<Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="outline">{value || 'Selecionar ano'}</Button></PopoverTrigger><PopoverContent className="w-[280px]"><div className="flex justify-between items-center mb-4"><Button size="icon" variant="ghost" onClick={() => setDecade(d => d - 10)}><ChevronLeft className="h-4 w-4" /></Button><span className="font-semibold">{decade} - {decade + 9}</span><Button size="icon" variant="ghost" onClick={() => setDecade(d => d + 10)}><ChevronRight className="h-4 w-4" /></Button></div><div className="grid grid-cols-5 gap-2">{years.map(y => <Button key={y} variant={value === y ? 'default' : 'outline'} size="sm" onClick={() => { onChange?.(y); setOpen(false); }}>{y}</Button>)}</div></PopoverContent></Popover>);
}
