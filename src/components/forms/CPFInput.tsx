import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface CPFInputProps { value?: string; onChange?: (value: string) => void; label?: string; showValidation?: boolean; }
export function CPFInput({ value = '', onChange, label, showValidation = true }: CPFInputProps) {
  const formatCPF = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };
  const validateCPF = (cpf: string) => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1+$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
    let check = 11 - (sum % 11);
    if (check >= 10) check = 0;
    if (check !== parseInt(digits[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
    check = 11 - (sum % 11);
    if (check >= 10) check = 0;
    return check === parseInt(digits[10]);
  };
  const isValid = value.replace(/\D/g, '').length === 11 ? validateCPF(value) : null;
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input value={value} onChange={e => onChange?.(formatCPF(e.target.value))} placeholder="000.000.000-00" className={showValidation && isValid !== null ? (isValid ? 'border-green-500' : 'border-red-500') : ''} />
      {showValidation && isValid === false && <p className="text-xs text-red-500">CPF inválido</p>}
    </div>
  );
}
