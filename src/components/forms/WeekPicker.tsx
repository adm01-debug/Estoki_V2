import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addWeeks, getWeek, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
interface WeekPickerProps { value?: Date; onChange?: (weekStart: Date) => void; }
export function WeekPicker({ value, onChange }: WeekPickerProps) {
  const [month, setMonth] = useState(value || new Date());
  const [open, setOpen] = useState(false);
  const weeks = useMemo(() => { const start = startOfWeek(new Date(month.getFullYear(), month.getMonth(), 1), { locale: ptBR }); return Array.from({ length: 6 }, (_, i) => addWeeks(start, i)); }, [month]);
  const selectWeek = (weekStart: Date) => { onChange?.(weekStart); setOpen(false); };
  return (<Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="outline">{value ? `Semana ${getWeek(value)} de ${getYear(value)}` : 'Selecionar semana'}</Button></PopoverTrigger><PopoverContent className="w-[280px]"><div className="flex justify-between items-center mb-4"><Button size="icon" variant="ghost" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}><ChevronLeft className="h-4 w-4" /></Button><span className="font-semibold">{format(month, 'MMMM yyyy', { locale: ptBR })}</span><Button size="icon" variant="ghost" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}><ChevronRight className="h-4 w-4" /></Button></div><div className="space-y-1">{weeks.map(w => <Button key={w.toISOString()} variant={value && getWeek(value) === getWeek(w) ? 'default' : 'outline'} className="w-full justify-start" size="sm" onClick={() => selectWeek(w)}>Semana {getWeek(w)}: {format(w, 'dd/MM')} - {format(addWeeks(w, 1), 'dd/MM')}</Button>)}</div></PopoverContent></Popover>);
}
