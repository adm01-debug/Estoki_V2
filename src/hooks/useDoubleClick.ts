import { useCallback, useRef } from 'react';

export function useDoubleClick<T extends HTMLElement = HTMLElement>(
  onDoubleClick: () => void,
  onSingleClick?: () => void,
  delay: number = 300
) {
  const clickCount = useRef(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const handleClick = useCallback(() => {
    clickCount.current += 1;
    if (clickCount.current === 1) {
      timerRef.current = setTimeout(() => {
        if (clickCount.current === 1) onSingleClick?.();
        clickCount.current = 0;
      }, delay);
    } else if (clickCount.current === 2) {
      clearTimeout(timerRef.current);
      onDoubleClick();
      clickCount.current = 0;
    }
  }, [onDoubleClick, onSingleClick, delay]);

  return handleClick;
}
