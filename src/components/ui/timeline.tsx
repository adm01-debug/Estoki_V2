import React from 'react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';
import { CheckCircle, Clock, XCircle, AlertTriangle, LucideIcon } from 'lucide-react';

type TimelineItemStatus = 'completed' | 'current' | 'pending' | 'error';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: Date | string;
  status?: TimelineItemStatus;
  icon?: LucideIcon;
  user?: string;
  metadata?: Record<string, any>;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  showConnector?: boolean;
}

const statusConfig: Record<TimelineItemStatus, { icon: LucideIcon; className: string; lineClass: string }> = {
  completed: { icon: CheckCircle, className: 'bg-green-100 text-green-600 border-green-200', lineClass: 'bg-green-200' },
  current: { icon: Clock, className: 'bg-blue-100 text-blue-600 border-blue-200 animate-pulse', lineClass: 'bg-blue-200' },
  pending: { icon: Clock, className: 'bg-gray-100 text-gray-400 border-gray-200', lineClass: 'bg-gray-200' },
  error: { icon: XCircle, className: 'bg-red-100 text-red-600 border-red-200', lineClass: 'bg-red-200' },
};

export function Timeline({ items, className, showConnector = true }: TimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, index) => {
        const status = item.status || 'pending';
        const config = statusConfig[status];
        const Icon = item.icon || config.icon;
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn('w-8 h-8 rounded-full border-2 flex items-center justify-center', config.className)}>
                <Icon className="h-4 w-4" />
              </div>
              {showConnector && !isLast && <div className={cn('w-0.5 flex-1 min-h-[2rem]', config.lineClass)} />}
            </div>

            <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-foreground">{item.title}</h4>
                  {item.description && <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>}
                  {item.user && <p className="text-xs text-muted-foreground mt-1">Por: {item.user}</p>}
                </div>
                {item.timestamp && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Timeline;
