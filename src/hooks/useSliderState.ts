import { useState, useCallback } from 'react';
export function useSliderState(initialValue = 0, min = 0, max = 100) {
  const [value, setValue] = useState(initialValue);
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setValue(Number(e.target.value)), []);
  const increase = useCallback((step = 1) => setValue(v => Math.min(max, v + step)), [max]);
  const decrease = useCallback((step = 1) => setValue(v => Math.max(min, v - step)), [min]);
  return { value, setValue, onChange, increase, decrease, min, max };
}
