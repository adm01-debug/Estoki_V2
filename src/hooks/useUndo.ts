import { useState, useCallback } from 'react';

export function useUndo<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const set = useCallback((newState: T) => {
    setPast(prev => [...prev, state]);
    setState(newState);
    setFuture([]);
  }, [state]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(prev => prev.slice(0, -1));
    setFuture(prev => [state, ...prev]);
    setState(previous);
  }, [past, state]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(prev => prev.slice(1));
    setPast(prev => [...prev, state]);
    setState(next);
  }, [future, state]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return { state, set, undo, redo, canUndo, canRedo };
}

export default useUndo;
