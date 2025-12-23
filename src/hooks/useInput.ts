import { useState, useCallback } from 'react';
export function useInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value), []);
  const reset = useCallback(() => setValue(initialValue), [initialValue]);
  const clear = useCallback(() => setValue(''), []);
  return { value, onChange, reset, clear, setValue };
}
