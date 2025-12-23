import { useState, useCallback } from 'react';
export function useTextareaState(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value), []);
  const reset = useCallback(() => setValue(initialValue), [initialValue]);
  const clear = useCallback(() => setValue(''), []);
  return { value, onChange, reset, clear, setValue, length: value.length };
}
