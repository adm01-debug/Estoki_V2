import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, X, ShieldCheck, ShieldAlert, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PasswordInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  showStrength?: boolean;
  checkBreached?: boolean;
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

// Verifica senha vazada usando Have I Been Pwned API (k-anonymity)
async function checkPasswordBreached(password: string): Promise<{ breached: boolean; count: number }> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) return { breached: false, count: 0 };
    
    const text = await response.text();
    const lines = text.split('\n');
    
    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        return { breached: true, count: parseInt(count.trim(), 10) };
      }
    }
    
    return { breached: false, count: 0 };
  } catch {
    return { breached: false, count: 0 };
  }
}

export function PasswordInput({
  value = '',
  onChange,
  label,
  showStrength = true,
  checkBreached = true,
  requirements = { minLength: 8, uppercase: true, lowercase: true, number: true, special: true },
  disabled,
  placeholder = '••••••••',
  id,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const [breachStatus, setBreachStatus] = useState<{ checking: boolean; breached: boolean; count: number }>({
    checking: false,
    breached: false,
    count: 0,
  });

  // Verifica senha vazada com debounce
  useEffect(() => {
    if (!checkBreached || !value || value.length < 8) {
      setBreachStatus({ checking: false, breached: false, count: 0 });
      return;
    }

    setBreachStatus(prev => ({ ...prev, checking: true }));
    const timeout = setTimeout(async () => {
      const result = await checkPasswordBreached(value);
      setBreachStatus({ checking: false, ...result });
    }, 500);

    return () => clearTimeout(timeout);
  }, [value, checkBreached]);

  const checks = {
    minLength: value.length >= (requirements.minLength || 8),
    uppercase: !requirements.uppercase || /[A-Z]/.test(value),
    lowercase: !requirements.lowercase || /[a-z]/.test(value),
    number: !requirements.number || /\d/.test(value),
    special: !requirements.special || /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'`~]/.test(value),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  const hasBreachPenalty = breachStatus.breached;
  const adjustedStrength = hasBreachPenalty ? 0 : (passed / total) * 100;

  const getStrengthInfo = () => {
    if (hasBreachPenalty) return { label: 'Comprometida', color: 'bg-destructive', textColor: 'text-destructive', icon: AlertTriangle };
    if (adjustedStrength < 40) return { label: 'Fraca', color: 'bg-destructive', textColor: 'text-destructive', icon: ShieldAlert };
    if (adjustedStrength < 70) return { label: 'Média', color: 'bg-yellow-500', textColor: 'text-yellow-600', icon: Shield };
    if (adjustedStrength < 100) return { label: 'Boa', color: 'bg-blue-500', textColor: 'text-blue-600', icon: Shield };
    return { label: 'Forte', color: 'bg-green-500', textColor: 'text-green-600', icon: ShieldCheck };
  };

  const strengthInfo = getStrengthInfo();
  const StrengthIcon = strengthInfo.icon;

  const requirementLabels: Record<string, string> = {
    minLength: `Mínimo ${requirements.minLength || 8} caracteres`,
    uppercase: 'Letra maiúscula (A-Z)',
    lowercase: 'Letra minúscula (a-z)',
    number: 'Número (0-9)',
    special: 'Caractere especial (!@#$%...)',
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
          className={cn("pr-10", hasBreachPenalty && "border-destructive focus-visible:ring-destructive")}
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
          {/* Breach Warning */}
          {hasBreachPenalty && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in-50">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Senha vazada!</p>
                <p className="text-muted-foreground">
                  Esta senha apareceu em {breachStatus.count.toLocaleString('pt-BR')} vazamentos de dados. 
                  Escolha uma senha diferente.
                </p>
              </div>
            </div>
          )}

          {/* Strength Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {breachStatus.checking ? (
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                ) : (
                  <StrengthIcon className={cn("h-4 w-4", strengthInfo.textColor)} />
                )}
                <span className={cn("text-sm font-medium", strengthInfo.textColor)}>
                  {breachStatus.checking ? 'Verificando...' : strengthInfo.label}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{passed}/{total} requisitos</span>
            </div>
            
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-300 ease-out rounded-full", strengthInfo.color)}
                style={{ width: `${adjustedStrength}%` }}
              />
            </div>
          </div>

          {/* Requirements Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
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
            
            {/* Breach Check Status */}
            {checkBreached && value.length >= 8 && (
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs transition-colors duration-200",
                  breachStatus.checking ? "text-muted-foreground" :
                  breachStatus.breached ? "text-destructive" : "text-green-600"
                )}
              >
                <div className={cn(
                  "h-4 w-4 rounded-full flex items-center justify-center transition-colors duration-200",
                  breachStatus.checking ? "bg-muted text-muted-foreground" :
                  breachStatus.breached ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-600"
                )}>
                  {breachStatus.checking ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : breachStatus.breached ? (
                    <X className="h-3 w-3" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </div>
                <span>
                  {breachStatus.checking ? 'Verificando vazamentos...' :
                   breachStatus.breached ? 'Senha encontrada em vazamentos' : 'Não encontrada em vazamentos'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordInput;