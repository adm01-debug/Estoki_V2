import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
interface SortableProps { id: string; children: React.ReactNode; className?: string; disabled?: boolean; }
export function Sortable({ id, children, className, disabled }: SortableProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className={cn("touch-none", isDragging && "z-50", className)} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
