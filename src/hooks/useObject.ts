import { useState, useCallback } from 'react';
export function useObject<T extends Record<string, any>>(initialValue: T) {
  const [object, setObject] = useState<T>(initialValue);
  const set = useCallback((key: keyof T, value: T[keyof T]) => setObject(o => ({ ...o, [key]: value })), []);
  const remove = useCallback((key: keyof T) => setObject(o => { const { [key]: _, ...rest } = o; return rest as T; }), []);
  const reset = useCallback(() => setObject(initialValue), [initialValue]);
  const merge = useCallback((partial: Partial<T>) => setObject(o => ({ ...o, ...partial })), []);
  return { object, setObject, set, remove, reset, merge };
}
