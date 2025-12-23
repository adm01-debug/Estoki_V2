import { useCallback, useRef, useState } from 'react';

export function useLongPress(callback: () => void, delay = 500) {
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<number>();

  const start = useCallback(() => {
    setIsPressed(true);
    timeoutRef.current = window.setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay]);

  const stop = useCallback(() => {
    setIsPressed(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    isPressed,
    handlers: {
      onMouseDown: start,
      onMouseUp: stop,
      onMouseLeave: stop,
      onTouchStart: start,
      onTouchEnd: stop,
    },
  };
}

export default useLongPress;
