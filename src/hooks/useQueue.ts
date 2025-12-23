import { useState, useCallback } from 'react';

export function useQueue<T>(initialValue: T[] = []) {
  const [queue, setQueue] = useState<T[]>(initialValue);

  const enqueue = useCallback((item: T) => {
    setQueue(prev => [...prev, item]);
  }, []);

  const dequeue = useCallback(() => {
    let removed: T | undefined;
    setQueue(prev => {
      removed = prev[0];
      return prev.slice(1);
    });
    return removed;
  }, []);

  const peek = useCallback(() => queue[0], [queue]);
  const clear = useCallback(() => setQueue([]), []);
  const size = queue.length;
  const isEmpty = size === 0;

  return { queue, enqueue, dequeue, peek, clear, size, isEmpty };
}

export default useQueue;
