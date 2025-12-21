import { ProgressBar } from "@/components/ui/progress-bar";
import { Star } from "lucide-react";

interface XPBarProps { xp: number; level: number; xpForNextLevel: number; }

export function XPBar({ xp, level, xpForNextLevel }: XPBarProps) {
  const progress = (xp / xpForNextLevel) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" />Nível {level}</span>
        <span className="text-muted-foreground">{xp}/{xpForNextLevel} XP</span>
      </div>
      <ProgressBar value={progress} max={100} size="sm" color="success" />
    </div>
  );
}
