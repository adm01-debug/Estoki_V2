import { useState, useCallback, useRef, useEffect } from 'react';
export function useMotionValue(initial: number) {
  const [value, setValue] = useState(initial);
  const velocity = useRef(0);
  const listeners = useRef<Set<(v: number) => void>>(new Set());
  const set = useCallback((v: number) => { velocity.current = v - value; setValue(v); listeners.current.forEach(l => l(v)); }, [value]);
  const onChange = useCallback((listener: (v: number) => void) => { listeners.current.add(listener); return () => listeners.current.delete(listener); }, []);
  return { get: () => value, set, getVelocity: () => velocity.current, onChange };
}
