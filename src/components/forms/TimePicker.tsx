import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
interface TimePickerProps { value?: string; onChange?: (time: string) => void; label?: string; }
export function TimePicker({ value = '12:00', onChange, label }: TimePickerProps) {
  const [hours, setHours] = useState(value.split(':')[0]);
  const [minutes, setMinutes] = useState(value.split(':')[1]);
  const updateTime = (h: string, m: string) => { onChange?.(`${h.padStart(2, '0')}:${m.padStart(2, '0')}`); };
  return (
    <div>
      {label && <Label className="mb-1">{label}</Label>}
      <div className="flex gap-1 items-center">
        <Input type="number" min={0} max={23} value={hours} onChange={(e) => { setHours(e.target.value); updateTime(e.target.value, minutes); }} className="w-16 text-center" />
        <span>:</span>
        <Input type="number" min={0} max={59} value={minutes} onChange={(e) => { setMinutes(e.target.value); updateTime(hours, e.target.value); }} className="w-16 text-center" />
      </div>
    </div>
  );
}
