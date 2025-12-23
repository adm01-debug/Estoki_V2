import { useState, useCallback } from 'react';
export function useOptimisticUpdate<T>(initialData: T) {
  const [data, setData] = useState(initialData);
  const [rollbackData, setRollbackData] = useState(initialData);
  const optimisticUpdate = useCallback((updater: (current: T) => T, asyncFn: () => Promise<T>) => {
    setRollbackData(data);
    setData(updater(data));
    asyncFn().then(setData).catch(() => setData(rollbackData));
  }, [data, rollbackData]);
  return { data, optimisticUpdate };
}
