import React, { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SplitPaneProps {
  children: [React.ReactNode, React.ReactNode];
  direction?: 'horizontal' | 'vertical';
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

export function SplitPane({
  children,
  direction = 'horizontal',
  defaultSize = 50,
  minSize = 10,
  maxSize = 90,
  className,
}: SplitPaneProps) {
  const [size, setSize] = useState(defaultSize);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
  }, [direction]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newSize = direction === 'horizontal'
      ? ((e.clientX - rect.left) / rect.width) * 100
      : ((e.clientY - rect.top) / rect.height) * 100;
    setSize(Math.min(Math.max(newSize, minSize), maxSize));
  }, [direction, minSize, maxSize]);

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const isHorizontal = direction === 'horizontal';

  return (
    <div ref={containerRef} className={cn('flex', isHorizontal ? 'flex-row' : 'flex-col', 'h-full', className)}>
      <div style={{ [isHorizontal ? 'width' : 'height']: `${size}%` }} className="overflow-auto">
        {children[0]}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'bg-border hover:bg-primary/20 transition-colors',
          isHorizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
        )}
      />
      <div style={{ [isHorizontal ? 'width' : 'height']: `${100 - size}%` }} className="overflow-auto">
        {children[1]}
      </div>
    </div>
  );
}
