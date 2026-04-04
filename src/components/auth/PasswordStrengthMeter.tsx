import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
}

const rules = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Letra minúscula", test: (p: string) => /[a-z]/.test(p) },
  { label: "Número", test: (p: string) => /[0-9]/.test(p) },
  { label: "Caractere especial", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const strengthLevels = [
  { label: "Muito fraca", color: "bg-destructive", textColor: "text-destructive" },
  { label: "Fraca", color: "bg-destructive/70", textColor: "text-destructive" },
  { label: "Razoável", color: "bg-warning", textColor: "text-warning" },
  { label: "Boa", color: "bg-info", textColor: "text-info" },
  { label: "Forte", color: "bg-success", textColor: "text-success" },
];

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { passed, strength } = useMemo(() => {
    const results = rules.map((r) => r.test(password));
    const count = results.filter(Boolean).length;
    return { passed: results, strength: count };
  }, [password]);

  if (!password) return null;

  const level = strengthLevels[Math.max(0, strength - 1)] ?? strengthLevels[0];
  const percent = (strength / rules.length) * 100;

  return (
    <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className={cn("text-[11px] font-semibold", level.textColor)}>
            {level.label}
          </span>
          <span className="text-[11px] text-sidebar-foreground/30">{strength}/{rules.length}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-sidebar-accent/60 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500 ease-out", level.color)}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Rules checklist */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {rules.map((rule, i) => (
          <div key={rule.label} className="flex items-center gap-1.5">
            {passed[i] ? (
              <Check className="h-3 w-3 text-success shrink-0" />
            ) : (
              <X className="h-3 w-3 text-sidebar-foreground/20 shrink-0" />
            )}
            <span
              className={cn(
                "text-[11px] transition-colors",
                passed[i] ? "text-success/80" : "text-sidebar-foreground/30"
              )}
            >
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
