import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
interface KanbanColumnProps { id: string; title: string; count?: number; color?: string; children: React.ReactNode; onAddCard?: () => void; }
export function KanbanColumn({ id, title, count, color, children, onAddCard }: KanbanColumnProps) {
  return (
    <Card className="flex-shrink-0 w-72 max-h-[calc(100vh-200px)] flex flex-col">
      <CardHeader className="py-3 flex-shrink-0" style={{ borderTopColor: color, borderTopWidth: color ? 3 : 0 }}>
        <div className="flex justify-between items-center"><CardTitle className="text-sm">{title}</CardTitle>{count !== undefined && <Badge variant="secondary">{count}</Badge>}</div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2 pb-3">{children}</CardContent>
    </Card>
  );
}
