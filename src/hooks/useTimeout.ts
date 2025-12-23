import { useEffect, useRef, useCallback } from 'react';
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;
  const clear = useRef<() => void>(() => {});
  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    clear.current = () => clearTimeout(id);
    return () => clearTimeout(id);
  }, [delay]);
  return clear.current;
}
