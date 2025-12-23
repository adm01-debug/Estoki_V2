import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
interface TimelineItem { id: string; title: string; description?: string; date: Date; icon?: React.ReactNode; user?: { name: string; avatar?: string }; status?: 'completed' | 'current' | 'pending'; }
interface TimelineProps { items: TimelineItem[]; orientation?: 'vertical' | 'horizontal'; }
export function Timeline({ items, orientation = 'vertical' }: TimelineProps) {
  const statusColors = { completed: 'bg-green-500', current: 'bg-blue-500', pending: 'bg-gray-300' };
  if (orientation === 'horizontal') {
    return (
      <div className="flex items-center overflow-x-auto pb-4">
        {items.map((item, i) => (
          <div key={item.id} className="flex items-center">
            <div className="flex flex-col items-center min-w-32">
              <div className={`w-4 h-4 rounded-full ${statusColors[item.status || 'pending']}`} />
              <div className="mt-2 text-center"><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.date.toLocaleDateString()}</p></div>
            </div>
            {i < items.length - 1 && <div className="w-12 h-0.5 bg-border" />}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center"><div className={`w-3 h-3 rounded-full ${statusColors[item.status || 'pending']}`} />{i < items.length - 1 && <div className="w-0.5 flex-1 bg-border" />}</div>
          <Card className="flex-1 p-3">
            <div className="flex justify-between items-start">
              <div><h4 className="font-medium">{item.title}</h4>{item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}</div>
              <div className="text-right">{item.user && <div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarImage src={item.user.avatar} /><AvatarFallback>{item.user.name[0]}</AvatarFallback></Avatar><span className="text-xs">{item.user.name}</span></div>}<p className="text-xs text-muted-foreground">{item.date.toLocaleString()}</p></div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
