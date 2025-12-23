import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
interface TextareaCounterProps { value?: string; onChange?: (value: string) => void; label?: string; maxLength?: number; minLength?: number; rows?: number; placeholder?: string; }
export function TextareaCounter({ value = '', onChange, label, maxLength = 500, minLength = 0, rows = 4, placeholder }: TextareaCounterProps) {
  const remaining = maxLength - value.length;
  const isOverLimit = remaining < 0;
  const isUnderLimit = value.length < minLength;
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Textarea value={value} onChange={e => onChange?.(e.target.value)} rows={rows} placeholder={placeholder} className={isOverLimit ? 'border-red-500' : ''} />
      <div className="flex justify-between text-xs">
        <span className={isUnderLimit ? 'text-yellow-600' : 'text-muted-foreground'}>{minLength > 0 && `Mín: ${minLength}`}</span>
        <span className={isOverLimit ? 'text-red-500 font-medium' : remaining < 50 ? 'text-yellow-600' : 'text-muted-foreground'}>{value.length}/{maxLength}</span>
      </div>
    </div>
  );
}
