import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function FormField({ name, label, type = "text", placeholder, error, required, value, onChange, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} className={cn(error && "border-destructive")} aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined} />
      {error && <p id={`${name}-error`} className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
