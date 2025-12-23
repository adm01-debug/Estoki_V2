import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GripVertical, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface KanbanCardProps { id: string; title: string; description?: string; labels?: { text: string; color?: string }[]; assignee?: { name: string; avatar?: string }; dueDate?: Date; priority?: 'low' | 'medium' | 'high'; onClick?: () => void; onMenuClick?: () => void; }
export function KanbanCard({ id, title, description, labels, assignee, dueDate, priority, onClick, onMenuClick }: KanbanCardProps) {
  const priorityColors = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-red-100 text-red-800' };
  const isOverdue = dueDate && dueDate < new Date();
  return (
    <div className="bg-background border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow group" onClick={onClick}>
      <div className="flex items-start gap-2">
        <div className="mt-1 opacity-0 group-hover:opacity-100 cursor-grab"><GripVertical className="h-4 w-4 text-muted-foreground" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start"><h4 className="text-sm font-medium truncate">{title}</h4><Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={e => { e.stopPropagation(); onMenuClick?.(); }}><MoreHorizontal className="h-4 w-4" /></Button></div>
          {description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>}
          {labels && labels.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{labels.map((l, i) => <Badge key={i} variant="secondary" className="text-xs" style={{ backgroundColor: l.color }}>{l.text}</Badge>)}</div>}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">{priority && <Badge className={`text-xs ${priorityColors[priority]}`}>{priority}</Badge>}{dueDate && <span className={`text-xs ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>{dueDate.toLocaleDateString()}</span>}</div>
            {assignee && <div className="flex items-center gap-1">{assignee.avatar ? <img src={assignee.avatar} alt={assignee.name} className="w-5 h-5 rounded-full" /> : <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{assignee.name[0]}</div>}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
