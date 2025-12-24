import React from 'react';
import { DndContext, closestCenter, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
interface KanbanColumn { id: string; title: string; items: KanbanItem[]; }
interface KanbanItem { id: string; title: string; description?: string; }
interface KanbanBoardProps { columns: KanbanColumn[]; onDragEnd: (event: DragEndEvent) => void; renderItem?: (item: KanbanItem) => React.ReactNode; className?: string; }
export function KanbanBoard({ columns, onDragEnd, renderItem, className }: KanbanBoardProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);
  const handleDragEnd = (event: DragEndEvent) => { setActiveId(null); onDragEnd(event); };
  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={cn("flex gap-4 overflow-x-auto p-4", className)}>
        {columns.map(column => (
          <div key={column.id} className="flex-shrink-0 w-80 bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-4">{column.title} ({column.items.length})</h3>
            <SortableContext items={column.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {column.items.map(item => renderItem ? renderItem(item) : <div key={item.id} className="bg-background p-3 rounded border">{item.title}</div>)}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
