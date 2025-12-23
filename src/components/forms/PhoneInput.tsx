import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface PhoneInputProps { value?: string; onChange?: (value: string) => void; label?: string; country?: 'BR' | 'US'; }
export function PhoneInput({ value = '', onChange, label, country = 'BR' }: PhoneInputProps) {
  const masks = { BR: { mask: '(##) #####-####', placeholder: '(00) 00000-0000' }, US: { mask: '(###) ###-####', placeholder: '(000) 000-0000' } };
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (country === 'BR') {
      if (digits.length <= 2) return `(${digits}`;
      if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onChange?.(formatted);
  };
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input value={value} onChange={handleChange} placeholder={masks[country].placeholder} type="tel" />
    </div>
  );
}
