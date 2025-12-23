import { useState, useCallback } from 'react';
export function useRadioState<T>(initialValue: T) {
  const [selected, setSelected] = useState<T>(initialValue);
  const onChange = useCallback((value: T) => () => setSelected(value), []);
  const isSelected = useCallback((value: T) => selected === value, [selected]);
  return { selected, setSelected, onChange, isSelected };
}
