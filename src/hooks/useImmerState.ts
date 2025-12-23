import { useState, useCallback } from 'react';
export function useImmerState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const updateState = useCallback((recipe: (draft: T) => void | T) => {
    setState(current => {
      const draft = JSON.parse(JSON.stringify(current));
      const result = recipe(draft);
      return result !== undefined ? result : draft;
    });
  }, []);
  return [state, updateState] as const;
}
