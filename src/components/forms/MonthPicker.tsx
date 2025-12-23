import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight } from 'lucide-react';
interface MonthPickerProps { value?: Date; onChange?: (date: Date) => void; }
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [year, setYear] = useState(value?.getFullYear() || new Date().getFullYear());
  const [open, setOpen] = useState(false);
  const selectMonth = (month: number) => { onChange?.(new Date(year, month, 1)); setOpen(false); };
  return (<Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="outline">{value ? `${MONTHS[value.getMonth()]} ${value.getFullYear()}` : 'Selecionar mês'}</Button></PopoverTrigger><PopoverContent className="w-[280px]"><div className="flex justify-between items-center mb-4"><Button size="icon" variant="ghost" onClick={() => setYear(y => y - 1)}><ChevronLeft className="h-4 w-4" /></Button><span className="font-semibold">{year}</span><Button size="icon" variant="ghost" onClick={() => setYear(y => y + 1)}><ChevronRight className="h-4 w-4" /></Button></div><div className="grid grid-cols-3 gap-2">{MONTHS.map((m, i) => <Button key={m} variant={value?.getMonth() === i && value?.getFullYear() === year ? 'default' : 'outline'} size="sm" onClick={() => selectMonth(i)}>{m}</Button>)}</div></PopoverContent></Popover>);
}
