import { useState, useCallback } from 'react';
export function useSelectState<T>(initialValue: T | null = null) {
  const [selected, setSelected] = useState<T | null>(initialValue);
  const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => setSelected(e.target.value as unknown as T), []);
  const clear = useCallback(() => setSelected(null), []);
  return { selected, setSelected, onChange, clear };
}
