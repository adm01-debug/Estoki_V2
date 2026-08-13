import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
interface SwitchCardProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}
export function SwitchCard({
  checked = false,
  onChange,
  title,
  description,
  icon,
  disabled,
  className,
}: SwitchCardProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors",
        checked ? "border-primary bg-primary/5" : "hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <Checkbox checked={checked} onCheckedChange={onChange} disabled={disabled} className="mt-1" />
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </label>
  );
}
