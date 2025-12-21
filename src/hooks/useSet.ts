import { useState, useCallback } from "react";

export function useSet<T>(initial: Set<T> = new Set()) {
  const [set, setSet] = useState<Set<T>>(initial);

  const add = useCallback((item: T) => setSet(s => new Set(s).add(item)), []);
  const remove = useCallback((item: T) => setSet(s => { const n = new Set(s); n.delete(item); return n; }), []);
  const toggle = useCallback((item: T) => setSet(s => { const n = new Set(s); n.has(item) ? n.delete(item) : n.add(item); return n; }), []);
  const clear = useCallback(() => setSet(new Set()), []);
  const reset = useCallback(() => setSet(initial), [initial]);
  const has = useCallback((item: T) => set.has(item), [set]);

  return { set, add, remove, toggle, clear, reset, has, size: set.size };
}
