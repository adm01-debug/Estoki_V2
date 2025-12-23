import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface OTPInputProps { length?: number; value?: string; onChange?: (value: string) => void; label?: string; autoFocus?: boolean; }
export function OTPInput({ length = 6, value = '', onChange, label, autoFocus = true }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState(value.split('').slice(0, length));
  const handleChange = (index: number, digit: string) => {
    if (!/^\d?$/.test(digit)) return;
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    onChange?.(newOtp.join(''));
    if (digit && index < length - 1) inputRefs.current[index + 1]?.focus();
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newOtp = paste.split('');
    setOtp(newOtp);
    onChange?.(newOtp.join(''));
    inputRefs.current[Math.min(paste.length, length - 1)]?.focus();
  };
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">{Array.from({ length }, (_, i) => (
        <Input key={i} ref={el => inputRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={otp[i] || ''} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} onPaste={handlePaste} autoFocus={autoFocus && i === 0} className="w-12 h-12 text-center text-xl font-mono" />
      ))}</div>
    </div>
  );
}
