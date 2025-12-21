import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakIndicatorProps {
  streak: number;
  maxStreak?: number;
  className?: string;
}

export function StreakIndicator({ streak, maxStreak, className }: StreakIndicatorProps) {
  const isHot = streak >= 7;
  const isOnFire = streak >= 14;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("p-2 rounded-full", isOnFire ? "bg-orange-500 text-white animate-pulse" : isHot ? "bg-orange-400 text-white" : "bg-orange-100 text-orange-600")}>
        <Flame className="h-5 w-5" />
      </div>
      <div>
        <p className="font-bold text-lg">{streak} dias</p>
        {maxStreak && <p className="text-xs text-muted-foreground">Recorde: {maxStreak}</p>}
      </div>
    </div>
  );
}
