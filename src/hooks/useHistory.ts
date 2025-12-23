import { useState, useCallback } from 'react';
export function useHistory<T>(initialValue: T, maxHistory = 100) {
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [index, setIndex] = useState(0);
  const current = history[index];
  const push = useCallback((value: T) => {
    setHistory(h => [...h.slice(0, index + 1), value].slice(-maxHistory));
    setIndex(i => Math.min(i + 1, maxHistory - 1));
  }, [index, maxHistory]);
  const back = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);
  const forward = useCallback(() => setIndex(i => Math.min(history.length - 1, i + 1)), [history.length]);
  const go = useCallback((n: number) => setIndex(i => Math.max(0, Math.min(history.length - 1, i + n))), [history.length]);
  return { current, history, index, push, back, forward, go, canBack: index > 0, canForward: index < history.length - 1 };
}
