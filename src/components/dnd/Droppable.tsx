import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
interface DroppableProps { id: string; children: React.ReactNode; data?: Record<string, unknown>; disabled?: boolean; className?: string; }
export function Droppable({ id, children, data, disabled, className }: DroppableProps) {
  const { setNodeRef, isOver, active } = useDroppable({ id, data, disabled });
  return (
    <div ref={setNodeRef} className={cn("transition-colors", isOver && "bg-primary/10 ring-2 ring-primary", active && !isOver && "ring-1 ring-muted", className)}>
      {children}
    </div>
  );
}
