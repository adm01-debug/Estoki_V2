import { useState, useEffect, useCallback, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

 export function useDebouncedCallback<Args extends unknown[], R>(
   callback: (...args: Args) => R,
   delay: number
 ): (...args: Args) => void {
   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 
   return useCallback(
     (...args: Args) => {
       if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
       }
 
       timeoutRef.current = setTimeout(() => {
         callback(...args);
       }, delay);
     },
     [callback, delay]
   );
 }
