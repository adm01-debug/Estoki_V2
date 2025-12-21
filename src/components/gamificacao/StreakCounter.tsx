import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps { streak: number; className?: string; }

export function StreakCounter({ streak, className }: StreakCounterProps) {
  const isActive = streak > 0;
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Flame className={cn("h-5 w-5", isActive ? "text-orange-500" : "text-muted-foreground")} />
      <span className={cn("font-bold", isActive ? "text-orange-500" : "text-muted-foreground")}>{streak}</span>
      <span className="text-xs text-muted-foreground">dias</span>
    </div>
  );
}
