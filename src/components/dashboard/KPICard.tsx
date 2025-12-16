import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  sublabel?: string;
  variant?: "default" | "warning" | "success" | "danger";
  onClick?: () => void;
}

const variantStyles = {
  default: "text-primary",
  warning: "text-warning",
  success: "text-success",
  danger: "text-destructive",
};

const iconBgStyles = {
  default: "bg-primary/10",
  warning: "bg-warning/10",
  success: "bg-success/10",
  danger: "bg-destructive/10",
};

export function KPICard({ 
  icon: Icon, 
  value, 
  label, 
  sublabel,
  variant = "default",
  onClick 
}: KPICardProps) {
  return (
    <button
      onClick={onClick}
      className="kpi-card w-full text-center cursor-pointer"
    >
      <div className={cn(
        "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
        iconBgStyles[variant]
      )}>
        <Icon className={cn("h-6 w-6", variantStyles[variant])} />
      </div>
      <div className={cn("text-3xl font-bold mb-1", variantStyles[variant])}>
        {value}
      </div>
      <div className="text-sm font-medium text-foreground">{label}</div>
      {sublabel && (
        <div className="text-xs text-muted-foreground mt-0.5">{sublabel}</div>
      )}
    </button>
  );
}
