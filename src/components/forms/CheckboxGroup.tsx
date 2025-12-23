import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
interface CheckboxGroupProps { options: { value: string; label: string; disabled?: boolean }[]; value?: string[]; onChange?: (value: string[]) => void; orientation?: 'horizontal' | 'vertical'; }
export function CheckboxGroup({ options, value = [], onChange, orientation = 'vertical' }: CheckboxGroupProps) {
  const toggle = (v: string) => onChange?.(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  return (<div className={orientation === 'horizontal' ? 'flex gap-4' : 'space-y-2'}>{options.map(opt => <div key={opt.value} className="flex items-center space-x-2"><Checkbox id={opt.value} checked={value.includes(opt.value)} onCheckedChange={() => toggle(opt.value)} disabled={opt.disabled} /><Label htmlFor={opt.value} className={opt.disabled ? 'text-muted-foreground' : ''}>{opt.label}</Label></div>)}</div>);
}
