import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  sublabel?: string;
  variant?: "default" | "warning" | "success" | "danger";
  trend?: { value: number; isUp: boolean };
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
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

const gradientStyles = {
  default: "from-primary/5 to-primary/0",
  warning: "from-warning/5 to-warning/0",
  success: "from-success/5 to-success/0",
  danger: "from-destructive/5 to-destructive/0",
};

export function KPICard({ 
  icon: Icon, 
  value, 
  label, 
  sublabel,
  variant = "default",
  trend,
  onClick,
  size = "md"
}: KPICardProps) {
  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const iconSizes = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  const valueSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "kpi-card w-full text-left cursor-pointer group relative overflow-hidden",
        sizeClasses[size]
      )}
    >
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        gradientStyles[variant]
      )} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110",
            iconBgStyles[variant],
            iconSizes[size]
          )}>
            <Icon className={cn(
              "h-6 w-6 transition-all duration-200",
              variantStyles[variant],
              size === "lg" && "h-7 w-7"
            )} />
          </div>
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.isUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              <span>{trend.isUp ? "↑" : "↓"}</span>
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "font-bold mb-1 transition-transform duration-200 group-hover:translate-x-1",
          variantStyles[variant],
          valueSizes[size]
        )}>
          {value}
        </div>
        
        <div className="text-sm font-medium text-foreground">{label}</div>
        {sublabel && (
          <div className="text-xs text-muted-foreground mt-0.5">{sublabel}</div>
        )}
      </div>
    </button>
  );
}
