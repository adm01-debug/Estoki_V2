import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  sublabel?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  className,
  label,
  sublabel,
  variant = "default"
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const variantColors = {
    default: "stroke-primary",
    success: "stroke-success",
    warning: "stroke-warning",
    danger: "stroke-destructive",
  };

  const bgColors = {
    default: "stroke-primary/10",
    success: "stroke-success/10",
    warning: "stroke-warning/10",
    danger: "stroke-destructive/10",
  };

  const textColors = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={bgColors[variant]}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(variantColors[variant], "transition-all duration-500 ease-out")}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold", textColors[variant])}>
          {value}%
        </span>
        {label && (
          <span className="text-xs text-muted-foreground font-medium">{label}</span>
        )}
        {sublabel && (
          <span className="text-[10px] text-muted-foreground">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
