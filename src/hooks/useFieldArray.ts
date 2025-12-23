import { useState, useCallback } from 'react';
export function useFieldArray<T>(initialValue: T[] = []) {
  const [fields, setFields] = useState<T[]>(initialValue);
  const append = useCallback((item: T) => setFields(f => [...f, item]), []);
  const prepend = useCallback((item: T) => setFields(f => [item, ...f]), []);
  const remove = useCallback((index: number) => setFields(f => f.filter((_, i) => i !== index)), []);
  const insert = useCallback((index: number, item: T) => setFields(f => [...f.slice(0, index), item, ...f.slice(index)]), []);
  const move = useCallback((from: number, to: number) => setFields(f => { const arr = [...f]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return arr; }), []);
  const swap = useCallback((a: number, b: number) => setFields(f => { const arr = [...f]; [arr[a], arr[b]] = [arr[b], arr[a]]; return arr; }), []);
  const update = useCallback((index: number, item: T) => setFields(f => f.map((v, i) => i === index ? item : v)), []);
  return { fields, append, prepend, remove, insert, move, swap, update, replace: setFields };
}
