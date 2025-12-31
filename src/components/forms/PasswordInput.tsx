import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, X, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PasswordInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  showStrength?: boolean;
  requirements?: {
    minLength?: number;
    uppercase?: boolean;
    lowercase?: boolean;
    number?: boolean;
    special?: boolean;
  };
  disabled?: boolean;
  placeholder?: string;
  id?: string;
}

export function PasswordInput({
  value = '',
  onChange,
  label,
  showStrength = true,
  requirements = { minLength: 8, uppercase: true, lowercase: true, number: true, special: true },
  disabled,
  placeholder = '••••••••',
  id,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  const checks = {
    minLength: value.length >= (requirements.minLength || 8),
    uppercase: !requirements.uppercase || /[A-Z]/.test(value),
    lowercase: !requirements.lowercase || /[a-z]/.test(value),
    number: !requirements.number || /\d/.test(value),
    special: !requirements.special || /[!@#$%^&*(),.?":{}|<>]/.test(value),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  const strength = (passed / total) * 100;

  const getStrengthInfo = () => {
    if (strength < 40) return { label: 'Fraca', color: 'bg-destructive', textColor: 'text-destructive', icon: ShieldAlert };
    if (strength < 70) return { label: 'Média', color: 'bg-yellow-500', textColor: 'text-yellow-600', icon: Shield };
    if (strength < 100) return { label: 'Boa', color: 'bg-blue-500', textColor: 'text-blue-600', icon: Shield };
    return { label: 'Forte', color: 'bg-green-500', textColor: 'text-green-600', icon: ShieldCheck };
  };

  const strengthInfo = getStrengthInfo();
  const StrengthIcon = strengthInfo.icon;

  const requirementLabels: Record<string, string> = {
    minLength: `${requirements.minLength || 8}+ caracteres`,
    uppercase: 'Letra maiúscula',
    lowercase: 'Letra minúscula',
    number: 'Número',
    special: 'Caractere especial',
  };

  return (
    <div className="space-y-3">
      {label && <Label htmlFor={id}>{label}</Label>}
      
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="pr-10"
          disabled={disabled}
          placeholder={placeholder}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full hover:bg-transparent"
          onClick={() => setShow(!show)}
          disabled={disabled}
        >
          {show ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
        </Button>
      </div>

      {showStrength && value && (
        <div className="space-y-3 animate-in fade-in-50 slide-in-from-top-1 duration-200">
          {/* Strength Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <StrengthIcon className={cn("h-4 w-4", strengthInfo.textColor)} />
                <span className={cn("text-sm font-medium", strengthInfo.textColor)}>
                  {strengthInfo.label}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{passed}/{total} requisitos</span>
            </div>
            
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-300 ease-out rounded-full", strengthInfo.color)}
                style={{ width: `${strength}%` }}
              />
            </div>
          </div>

          {/* Requirements Checklist */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {Object.entries(requirementLabels).map(([key, label]) => {
              if (requirements[key as keyof typeof requirements] === false) return null;
              const isPassed = checks[key as keyof typeof checks];
              
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-center gap-1.5 text-xs transition-colors duration-200",
                    isPassed ? "text-green-600" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "h-4 w-4 rounded-full flex items-center justify-center transition-colors duration-200",
                    isPassed ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                  )}>
                    {isPassed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  </div>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordInput;