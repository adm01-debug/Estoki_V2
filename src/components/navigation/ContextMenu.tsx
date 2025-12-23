import React, { useState } from 'react';
import { cn } from '@/lib/utils';
interface ContextMenuProps { children: React.ReactNode; items: { label: string; onClick: () => void; icon?: React.ReactNode }[]; }
export function ContextMenu({ children, items }: ContextMenuProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const handleContextMenu = (e: React.MouseEvent) => { e.preventDefault(); setPos({ x: e.clientX, y: e.clientY }); };
  return (
    <div onContextMenu={handleContextMenu}>
      {children}
      {pos && (
        <div className="fixed z-50 bg-background border rounded-md shadow-lg py-1" style={{ left: pos.x, top: pos.y }} onClick={() => setPos(null)}>
          {items.map((item, i) => (<div key={i} className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2" onClick={item.onClick}>{item.icon}{item.label}</div>))}
        </div>
      )}
      {pos && <div className="fixed inset-0 z-40" onClick={() => setPos(null)} />}
    </div>
  );
}
