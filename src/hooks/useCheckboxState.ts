import { useState, useCallback } from 'react';
export function useCheckboxState(initialValue = false) {
  const [checked, setChecked] = useState(initialValue);
  const toggle = useCallback(() => setChecked(c => !c), []);
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setChecked(e.target.checked), []);
  return { checked, setChecked, toggle, onChange };
}
