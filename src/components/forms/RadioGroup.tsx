import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup as ShadcnRadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
interface RadioGroupProps { options: { value: string; label: string; disabled?: boolean }[]; value?: string; onChange?: (value: string) => void; orientation?: 'horizontal' | 'vertical'; }
export function RadioGroup({ options, value, onChange, orientation = 'vertical' }: RadioGroupProps) {
  return (<ShadcnRadioGroup value={value} onValueChange={onChange} className={orientation === 'horizontal' ? 'flex gap-4' : 'space-y-2'}>{options.map(opt => <div key={opt.value} className="flex items-center space-x-2"><RadioGroupItem value={opt.value} id={opt.value} disabled={opt.disabled} /><Label htmlFor={opt.value} className={opt.disabled ? 'text-muted-foreground' : ''}>{opt.label}</Label></div>)}</ShadcnRadioGroup>);
}
