import React from 'react';
import { GripVertical } from 'lucide-react';
interface DragHandleProps { className?: string; }
export function DragHandle({ className }: DragHandleProps) {
  return <div className={`cursor-grab hover:text-primary active:cursor-grabbing ${className}`}><GripVertical className="h-5 w-5" /></div>;
}
