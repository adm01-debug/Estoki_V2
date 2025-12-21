import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Option { value: string; label: string; }

interface SelectFieldProps {
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SelectField({ name, label, options, placeholder = "Selecione...", error, required, value, onChange, className }: SelectFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={name} className={cn(error && "border-destructive")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
