import { useState, useCallback, useRef } from 'react';
export function useTransitionState<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const startTransition = useCallback((newValue: T, duration = 300) => {
    setIsPending(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { setValue(newValue); setIsPending(false); }, duration);
  }, []);
  return { value, isPending, startTransition };
}
