import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const sizes = { sm: "h-1", md: "h-2", lg: "h-3" };
const colors = {
  default: "bg-primary",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
};

export function ProgressBar({ value, max = 100, showLabel, size = "md", color = "default", className }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const autoColor = percentage >= 90 ? "danger" : percentage >= 70 ? "warning" : percentage >= 50 ? "default" : "success";
  const finalColor = color === "default" ? autoColor : color;

  return (
    <div className={cn("w-full", className)}>
      {showLabel && <div className="flex justify-between mb-1 text-sm"><span>{value}</span><span>{max}</span></div>}
      <div className={cn("w-full bg-secondary rounded-full overflow-hidden", sizes[size])}>
        <div className={cn("h-full transition-all duration-300", colors[finalColor])} style={{ width: `${percentage}%` }} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} />
      </div>
    </div>
  );
}
