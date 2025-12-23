import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
interface DateTimePickerProps { value?: Date; onChange?: (date: Date) => void; }
export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>(value);
  const [time, setTime] = useState(value ? format(value, 'HH:mm') : '00:00');
  const handleDateChange = (d: Date | undefined) => { if (d) { const [hours, minutes] = time.split(':').map(Number); d.setHours(hours, minutes); setDate(d); onChange?.(d); } };
  const handleTimeChange = (t: string) => { setTime(t); if (date) { const [hours, minutes] = t.split(':').map(Number); const newDate = new Date(date); newDate.setHours(hours, minutes); setDate(newDate); onChange?.(newDate); } };
  return (<div className="flex gap-2"><Popover><PopoverTrigger asChild><Button variant="outline" className="w-[200px] justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, 'dd/MM/yyyy') : 'Selecionar data'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={handleDateChange} /></PopoverContent></Popover><div className="relative"><Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input type="time" value={time} onChange={e => handleTimeChange(e.target.value)} className="pl-10 w-[120px]" /></div></div>);
}
