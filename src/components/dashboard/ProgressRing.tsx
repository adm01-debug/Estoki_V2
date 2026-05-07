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
    default: "stroke-primary/5",
    success: "stroke-success/5",
    warning: "stroke-warning/5",
    danger: "stroke-destructive/5",
  };

  const textColors = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  };

  const shadowColors = {
    default: "drop-shadow-[0_0_8px_hsl(var(--primary)/0.3)]",
    success: "drop-shadow-[0_0_8px_hsl(var(--success)/0.3)]",
    warning: "drop-shadow-[0_0_8px_hsl(var(--warning)/0.3)]",
    danger: "drop-shadow-[0_0_8px_hsl(var(--destructive)/0.3)]",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center group", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={`grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={textColors[variant]} stopOpacity="1" />
            <stop offset="100%" className={textColors[variant]} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn(bgColors[variant], "stroke-current")}
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
          stroke={`url(#grad-${variant})`}
          className={cn(
            "transition-all duration-1000 ease-[cubic-bezier(0.16, 1, 0.3, 1)]",
            shadowColors[variant]
          )}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-500 group-hover:scale-110">
        <span className={cn("text-3xl font-black tracking-tighter leading-none", textColors[variant])}>
          {value}<span className="text-sm font-bold opacity-70">%</span>
        </span>
        {label && (
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-2">{label}</span>
        )}
        {sublabel && (
          <span className="text-[9px] text-muted-foreground/40 font-medium">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
