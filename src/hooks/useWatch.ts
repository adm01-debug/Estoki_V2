import { useEffect, useRef } from 'react';
export function useWatch<T>(value: T, callback: (value: T, prevValue: T) => void) {
  const prevRef = useRef<T>(value);
  useEffect(() => { if (prevRef.current !== value) { callback(value, prevRef.current); prevRef.current = value; } }, [value, callback]);
}
