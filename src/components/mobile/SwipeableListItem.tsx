import { ReactNode, useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface SwipeableListItemProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: ReactNode;
    label: string;
    color: string;
    onClick: () => void;
  };
  rightAction?: {
    icon: ReactNode;
    label: string;
    color: string;
    onClick: () => void;
  };
  className?: string;
}

export function SwipeableListItem({
  children,
  leftAction,
  rightAction,
  className,
}: SwipeableListItemProps) {
  const [offset, setOffset] = useState(0);
  const [isOpen, setIsOpen] = useState<'left' | 'right' | null>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const ACTION_WIDTH = 80;
  const THRESHOLD = 40;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // Adjust for already open state
    let newOffset = isOpen === 'right' ? diff - ACTION_WIDTH : 
                    isOpen === 'left' ? diff + ACTION_WIDTH : diff;

    // Apply resistance at edges
    if (newOffset > ACTION_WIDTH) {
      newOffset = ACTION_WIDTH + (newOffset - ACTION_WIDTH) * 0.3;
    } else if (newOffset < -ACTION_WIDTH) {
      newOffset = -ACTION_WIDTH + (newOffset + ACTION_WIDTH) * 0.3;
    }

    // Limit based on available actions
    if (!leftAction && newOffset > 0) newOffset = 0;
    if (!rightAction && newOffset < 0) newOffset = 0;

    setOffset(newOffset);
  }, [isOpen, leftAction, rightAction]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;

    if (offset > THRESHOLD && leftAction) {
      setOffset(ACTION_WIDTH);
      setIsOpen('left');
    } else if (offset < -THRESHOLD && rightAction) {
      setOffset(-ACTION_WIDTH);
      setIsOpen('right');
    } else {
      setOffset(0);
      setIsOpen(null);
    }
  }, [offset, leftAction, rightAction]);

  const handleActionClick = useCallback((action: () => void) => {
    action();
    setOffset(0);
    setIsOpen(null);
  }, []);

  const close = useCallback(() => {
    setOffset(0);
    setIsOpen(null);
  }, []);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Left Action (revealed on swipe right) */}
      {leftAction && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 flex items-center justify-center',
            leftAction.color
          )}
          style={{ width: ACTION_WIDTH }}
          onClick={() => handleActionClick(leftAction.onClick)}
        >
          <div className="flex flex-col items-center text-white">
            {leftAction.icon}
            <span className="text-xs mt-1">{leftAction.label}</span>
          </div>
        </div>
      )}

      {/* Right Action (revealed on swipe left) */}
      {rightAction && (
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 flex items-center justify-center',
            rightAction.color
          )}
          style={{ width: ACTION_WIDTH }}
          onClick={() => handleActionClick(rightAction.onClick)}
        >
          <div className="flex flex-col items-center text-white">
            {rightAction.icon}
            <span className="text-xs mt-1">{rightAction.label}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          'relative bg-background transition-transform duration-200',
          isDragging.current ? '' : 'transition-transform'
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={isOpen ? close : undefined}
      >
        {children}
        
        {/* Swipe indicators */}
        {!isOpen && (
          <>
            {leftAction && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
            {rightAction && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                <ChevronLeft className="h-4 w-4" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Pull to refresh indicator component
interface PullToRefreshIndicatorProps {
  pullDistance: number;
  threshold: number;
  isRefreshing: boolean;
}

export function PullToRefreshIndicator({
  pullDistance,
  threshold,
  isRefreshing,
}: PullToRefreshIndicatorProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180;

  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div
      className="flex items-center justify-center py-4 transition-all"
      style={{ height: pullDistance || (isRefreshing ? 60 : 0) }}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center',
          isRefreshing && 'animate-spin'
        )}
        style={{
          opacity: progress,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {!isRefreshing && (
          <MoreHorizontal className="h-4 w-4 text-primary" />
        )}
      </div>
    </div>
  );
}
