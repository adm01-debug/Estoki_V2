import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
interface MultiSelectProps { options: { value: string; label: string }[]; value?: string[]; onChange?: (values: string[]) => void; placeholder?: string; }
export function MultiSelect({ options, value = [], onChange, placeholder = 'Selecione...' }: MultiSelectProps) {
  const toggle = (optValue: string) => {
    onChange?.(value.includes(optValue) ? value.filter(v => v !== optValue) : [...value, optValue]);
  };
  const remove = (optValue: string) => onChange?.(value.filter(v => v !== optValue));
  const selectedLabels = options.filter(o => value.includes(o.value));
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 min-h-[38px] p-2 border rounded-md">
        {selectedLabels.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
        {selectedLabels.map(o => <Badge key={o.value} variant="secondary" className="gap-1">{o.label}<button type="button" onClick={() => remove(o.value)}><X className="h-3 w-3" /></button></Badge>)}
      </div>
      <div className="border rounded-md p-2 max-h-[200px] overflow-auto space-y-1">
        {options.map(o => <label key={o.value} className="flex items-center gap-2 p-1 hover:bg-muted rounded cursor-pointer"><Checkbox checked={value.includes(o.value)} onCheckedChange={() => toggle(o.value)} />{o.label}</label>)}
      </div>
    </div>
  );
}
