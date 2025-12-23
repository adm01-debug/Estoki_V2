import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
interface PasswordInputProps { value?: string; onChange?: (value: string) => void; label?: string; showStrength?: boolean; requirements?: { minLength?: number; uppercase?: boolean; lowercase?: boolean; number?: boolean; special?: boolean }; }
export function PasswordInput({ value = '', onChange, label, showStrength = true, requirements = { minLength: 8, uppercase: true, lowercase: true, number: true, special: true } }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const checks = { minLength: value.length >= (requirements.minLength || 8), uppercase: !requirements.uppercase || /[A-Z]/.test(value), lowercase: !requirements.lowercase || /[a-z]/.test(value), number: !requirements.number || /\d/.test(value), special: !requirements.special || /[!@#$%^&*(),.?":{}|<>]/.test(value) };
  const passed = Object.values(checks).filter(Boolean).length;
  const strength = (passed / Object.keys(checks).length) * 100;
  const strengthColor = strength < 40 ? 'bg-red-500' : strength < 70 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="relative"><Input type={show ? 'text' : 'password'} value={value} onChange={e => onChange?.(e.target.value)} className="pr-10" /><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setShow(!show)}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div>
      {showStrength && value && (
        <div className="space-y-2">
          <Progress value={strength} className={`h-1 ${strengthColor}`} />
          <div className="grid grid-cols-2 gap-1 text-xs">{Object.entries({ minLength: `${requirements.minLength}+ caracteres`, uppercase: 'Maiúscula', lowercase: 'Minúscula', number: 'Número', special: 'Especial' }).map(([key, label]) => requirements[key as keyof typeof requirements] !== false && <div key={key} className={`flex items-center gap-1 ${checks[key as keyof typeof checks] ? 'text-green-600' : 'text-muted-foreground'}`}>{checks[key as keyof typeof checks] ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}{label}</div>)}</div>
        </div>
      )}
    </div>
  );
}
