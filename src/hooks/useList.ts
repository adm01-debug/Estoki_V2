import { useState, useCallback } from "react";

export function useList<T>(initial: T[] = []) {
  const [list, setList] = useState<T[]>(initial);

  const add = useCallback((item: T) => setList(l => [...l, item]), []);
  const remove = useCallback((index: number) => setList(l => l.filter((_, i) => i !== index)), []);
  const update = useCallback((index: number, item: T) => setList(l => l.map((v, i) => i === index ? item : v)), []);
  const clear = useCallback(() => setList([]), []);
  const reset = useCallback(() => setList(initial), [initial]);

  return { list, add, remove, update, clear, reset, set: setList };
}
