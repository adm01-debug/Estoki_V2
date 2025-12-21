import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Target, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyChallengeProps { title: string; progress: number; goal: number; xp: number; completed?: boolean; }

export function DailyChallenge({ title, progress, goal, xp, completed }: DailyChallengeProps) {
  return (
    <Card className={cn(completed && "border-green-500 bg-green-50 dark:bg-green-950")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">{completed ? <Check className="h-4 w-4 text-green-500" /> : <Target className="h-4 w-4" />}{title}</span>
          <span className="text-xs text-yellow-600">+{xp} XP</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ProgressBar value={progress} max={goal} showLabel size="sm" />
      </CardContent>
    </Card>
  );
}
