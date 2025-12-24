import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StockLevelIndicatorProps { current: number; minimum: number; maximum: number; reorderPoint?: number; showLabels?: boolean; className?: string; }

export function StockLevelIndicator({ current, minimum, maximum, reorderPoint, showLabels = false, className }: StockLevelIndicatorProps) {
  const percentage = Math.min(100, Math.max(0, ((current - minimum) / (maximum - minimum)) * 100));
  const reorderPercentage = reorderPoint ? ((reorderPoint - minimum) / (maximum - minimum)) * 100 : 0;
  const getColor = () => { if (reorderPoint && current <= reorderPoint) return 'bg-red-500'; if (percentage < 25) return 'bg-red-500'; if (percentage < 50) return 'bg-yellow-500'; return 'bg-green-500'; };

  return (
    <TooltipProvider>
      <div className={cn("space-y-1", className)}>
        {showLabels && <div className="flex justify-between text-xs text-muted-foreground"><span>{minimum}</span><span>{maximum}</span></div>}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div className={cn("h-full transition-all", getColor())} style={{ width: `${percentage}%` }} />
              {reorderPoint && <div className="absolute top-0 bottom-0 w-0.5 bg-orange-500" style={{ left: `${reorderPercentage}%` }} />}
            </div>
          </TooltipTrigger>
          <TooltipContent><p>Atual: {current}</p>{reorderPoint && <p>Ponto de Reposição: {reorderPoint}</p>}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
