import React, { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
interface CurrencyInputProps {
  value?: number;
  onChange?: (value: number) => void;
  label?: string;
  currency?: string;
  locale?: string;
  min?: number;
  max?: number;
}
export function CurrencyInput({
  value = 0,
  onChange,
  label,
  currency = "BRL",
  locale = "pt-BR",
  min,
  max,
}: CurrencyInputProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(val);
  const [displayValue, setDisplayValue] = React.useState(formatCurrency(value));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const numValue = parseInt(raw || "0", 10) / 100;
    const clamped = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, numValue));
    setDisplayValue(formatCurrency(clamped));
    onChange?.(clamped);
  };
  const uid = useId();

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={uid}>{label}</Label>}
      <Input
        id={uid}
        value={displayValue}
        onChange={handleChange}
        className="text-right font-mono"
      />
    </div>
  );
}
