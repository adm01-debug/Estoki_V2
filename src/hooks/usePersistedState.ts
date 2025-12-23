import { useState, useEffect, useCallback } from 'react';

type StorageType = 'local' | 'session';

export function usePersistedState<T>(key: string, initialValue: T, storage: StorageType = 'local') {
  const storageObj = storage === 'local' ? localStorage : sessionStorage;

  const [state, setState] = useState<T>(() => {
    try {
      const item = storageObj.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  useEffect(() => {
    try { storageObj.setItem(key, JSON.stringify(state)); }
    catch (error) { console.error('Failed to persist state:', error); }
  }, [key, state, storageObj]);

  const clearPersistedState = useCallback(() => {
    storageObj.removeItem(key);
    setState(initialValue);
  }, [key, initialValue, storageObj]);

  return [state, setState, clearPersistedState] as const;
}
