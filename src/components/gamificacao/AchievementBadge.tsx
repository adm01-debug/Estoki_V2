import { Trophy, Star, Target, Flame, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, any> = { trophy: Trophy, star: Star, target: Target, flame: Flame, award: Award };

interface AchievementBadgeProps { icon: string; name: string; unlocked?: boolean; size?: "sm" | "md" | "lg"; }

const sizes = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-16 w-16" };
const iconSizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };

export function AchievementBadge({ icon, name, unlocked = false, size = "md" }: AchievementBadgeProps) {
  const Icon = icons[icon] || Trophy;
  return (
    <div className="flex flex-col items-center gap-1" title={name}>
      <div className={cn("rounded-full flex items-center justify-center", sizes[size], unlocked ? "bg-yellow-100 text-yellow-600" : "bg-muted text-muted-foreground")}>
        <Icon className={iconSizes[size]} />
      </div>
      <span className="text-xs text-center truncate max-w-16">{name}</span>
    </div>
  );
}
