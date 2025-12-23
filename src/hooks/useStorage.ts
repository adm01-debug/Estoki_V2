import { useState, useCallback } from 'react';

export function useStorage<T>(key: string, initialValue: T, storage: Storage = localStorage) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      storage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Storage error:', error);
    }
  }, [key, value, storage]);

  const removeValue = useCallback(() => {
    try {
      storage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }, [key, initialValue, storage]);

  return [value, setStoredValue, removeValue] as const;
}

export default useStorage;
