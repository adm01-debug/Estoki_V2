import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
interface ColorPickerProps { value?: string; onChange?: (color: string) => void; label?: string; presets?: string[]; }
const defaultPresets = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#000000', '#ffffff'];
export function ColorPicker({ value = '#3b82f6', onChange, label, presets = defaultPresets }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {label && <Label className="mb-1">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild><div className="w-10 h-10 rounded border cursor-pointer" style={{ backgroundColor: value }} /></PopoverTrigger>
        <PopoverContent className="w-auto">
          <div className="grid grid-cols-5 gap-2 mb-2">{presets.map(color => (<div key={color} className="w-6 h-6 rounded cursor-pointer border" style={{ backgroundColor: color }} onClick={() => { onChange?.(color); setOpen(false); }} />))}</div>
          <Input type="color" value={value} onChange={(e) => onChange?.(e.target.value)} className="w-full h-8" />
        </PopoverContent>
      </Popover>
    </div>
  );
}
