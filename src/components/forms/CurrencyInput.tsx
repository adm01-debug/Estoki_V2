import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface CurrencyInputProps { value?: number; onChange?: (value: number) => void; label?: string; currency?: string; locale?: string; min?: number; max?: number; }
export function CurrencyInput({ value = 0, onChange, label, currency = 'BRL', locale = 'pt-BR', min, max }: CurrencyInputProps) {
  const formatCurrency = (val: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(val);
  const [displayValue, setDisplayValue] = React.useState(formatCurrency(value));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(raw || '0', 10) / 100;
    const clamped = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, numValue));
    setDisplayValue(formatCurrency(clamped));
    onChange?.(clamped);
  };
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input value={displayValue} onChange={handleChange} className="text-right font-mono" />
    </div>
  );
}
