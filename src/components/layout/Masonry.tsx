import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MasonryProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

export function Masonry({ children, columns = 3, gap = 16, className }: MasonryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnHeights, setColumnHeights] = useState<number[]>(Array(columns).fill(0));

  const childrenArray = React.Children.toArray(children);

  const getColumnIndex = () => {
    return columnHeights.indexOf(Math.min(...columnHeights));
  };

  return (
    <div
      ref={containerRef}
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {childrenArray.map((child, index) => (
        <div key={index} className="break-inside-avoid">
          {child}
        </div>
      ))}
    </div>
  );
}
