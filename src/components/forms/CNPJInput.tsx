import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface CNPJInputProps { value?: string; onChange?: (value: string) => void; label?: string; showValidation?: boolean; }
export function CNPJInput({ value = '', onChange, label, showValidation = true }: CNPJInputProps) {
  const formatCNPJ = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };
  const validateCNPJ = (cnpj: string) => {
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length !== 14) return false;
    if (/^(\d)\1+$/.test(digits)) return false;
    const calc = (x: number) => { let sum = 0, pos = x - 7; for (let i = 0; i < x; i++) { sum += parseInt(digits[i]) * pos--; if (pos < 2) pos = 9; } const r = sum % 11; return r < 2 ? 0 : 11 - r; };
    return calc(12) === parseInt(digits[12]) && calc(13) === parseInt(digits[13]);
  };
  const isValid = value.replace(/\D/g, '').length === 14 ? validateCNPJ(value) : null;
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input value={value} onChange={e => onChange?.(formatCNPJ(e.target.value))} placeholder="00.000.000/0000-00" className={showValidation && isValid !== null ? (isValid ? 'border-green-500' : 'border-red-500') : ''} />
      {showValidation && isValid === false && <p className="text-xs text-red-500">CNPJ inválido</p>}
    </div>
  );
}
