import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
interface NumberInputProps { value?: number; onChange?: (value: number) => void; label?: string; min?: number; max?: number; step?: number; showControls?: boolean; }
export function NumberInput({ value = 0, onChange, label, min = 0, max = Infinity, step = 1, showControls = true }: NumberInputProps) {
  const increment = () => onChange?.(Math.min(max, value + step));
  const decrement = () => onChange?.(Math.max(min, value - step));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value) || 0;
    onChange?.(Math.max(min, Math.min(max, num)));
  };
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex">
        {showControls && <Button type="button" variant="outline" size="icon" onClick={decrement} disabled={value <= min} className="rounded-r-none"><Minus className="h-4 w-4" /></Button>}
        <Input type="number" value={value} onChange={handleChange} min={min} max={max} step={step} className={`text-center ${showControls ? 'rounded-none border-x-0' : ''}`} />
        {showControls && <Button type="button" variant="outline" size="icon" onClick={increment} disabled={value >= max} className="rounded-l-none"><Plus className="h-4 w-4" /></Button>}
      </div>
    </div>
  );
}
