import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface TextareaFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  className?: string;
}

export function TextareaField({ name, label, placeholder, error, required, value, onChange, rows = 3, className }: TextareaFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
      <Textarea id={name} name={name} placeholder={placeholder} value={value} onChange={onChange} rows={rows} className={cn(error && "border-destructive")} aria-invalid={!!error} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
