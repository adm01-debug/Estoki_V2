import { useState, useCallback, useRef, useEffect } from 'react';
export function useDeferredValue<T>(value: T, delay = 300): T {
  const [deferredValue, setDeferredValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();
  useEffect(() => { timeoutRef.current = setTimeout(() => setDeferredValue(value), delay); return () => clearTimeout(timeoutRef.current); }, [value, delay]);
  return deferredValue;
}
