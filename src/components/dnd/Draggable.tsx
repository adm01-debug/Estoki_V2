import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
interface DraggableProps { id: string; children: React.ReactNode; data?: Record<string, unknown>; disabled?: boolean; className?: string; }
export function Draggable({ id, children, data, disabled, className }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, data, disabled });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div ref={setNodeRef} style={style} className={cn("touch-none cursor-grab active:cursor-grabbing", isDragging && "opacity-50 z-50", className)} {...listeners} {...attributes}>
      {children}
    </div>
  );
}
