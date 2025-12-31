import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
interface DateRangePickerProps { from?: Date; to?: Date; onChange?: (range: { from?: Date; to?: Date }) => void; className?: string; }
export function DateRangePicker({ from, to, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('w-full justify-start text-left font-normal', className)}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {from ? (to ? `${format(from, 'LLL dd')} - ${format(to, 'LLL dd')}` : format(from, 'LLL dd')) : 'Pick dates'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0"><Calendar mode="range" selected={{ from, to }} onSelect={(range) => onChange?.(range || {})} numberOfMonths={2} /></PopoverContent>
    </Popover>
  );
}
