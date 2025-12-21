import { useState, useCallback } from "react";

interface UseCounterOptions { min?: number; max?: number; step?: number; }

export function useCounter(initial = 0, options: UseCounterOptions = {}) {
  const { min = -Infinity, max = Infinity, step = 1 } = options;
  const [count, setCount] = useState(initial);

  const increment = useCallback(() => setCount(c => Math.min(c + step, max)), [step, max]);
  const decrement = useCallback(() => setCount(c => Math.max(c - step, min)), [step, min]);
  const reset = useCallback(() => setCount(initial), [initial]);
  const set = useCallback((value: number) => setCount(Math.min(Math.max(value, min), max)), [min, max]);

  return { count, increment, decrement, reset, set };
}
