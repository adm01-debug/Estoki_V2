import React, { useRef, useState, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
interface VirtualGridProps<T> { data: T[]; columns: number; rowHeight: number; renderItem: (item: T, index: number) => React.ReactNode; }
export function VirtualGrid<T>({ data, columns, rowHeight, renderItem }: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(data.length / columns);
  const virtualizer = useVirtualizer({ count: rowCount, getScrollElement: () => parentRef.current, estimateSize: () => rowHeight, overscan: 5 });
  return (<div ref={parentRef} className="h-[600px] overflow-auto"><div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>{virtualizer.getVirtualItems().map(virtualRow => (<div key={virtualRow.key} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }} className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>{Array.from({ length: columns }).map((_, colIndex) => { const itemIndex = virtualRow.index * columns + colIndex; if (itemIndex >= data.length) return null; return <div key={colIndex}>{renderItem(data[itemIndex], itemIndex)}</div>; })}</div>))}</div></div>);
}
