import { useState, useCallback } from 'react';

export function useStack<T>(initialValue: T[] = []) {
  const [stack, setStack] = useState<T[]>(initialValue);

  const push = useCallback((item: T) => {
    setStack(prev => [...prev, item]);
  }, []);

  const pop = useCallback(() => {
    let removed: T | undefined;
    setStack(prev => {
      removed = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    return removed;
  }, []);

  const peek = useCallback(() => stack[stack.length - 1], [stack]);
  const clear = useCallback(() => setStack([]), []);
  const size = stack.length;
  const isEmpty = size === 0;

  return { stack, push, pop, peek, clear, size, isEmpty };
}

export default useStack;
